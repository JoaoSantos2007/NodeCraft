import Path from 'path';
import { Rcon } from 'rcon-client';
import Container from '../services/Container.js';
import File from '../services/File.js';
import config from '../../config/config.js';
import logger from '../../config/logger.js';
import { getIO } from '../../config/socket.js';
import Manager from '../services/Manager.js';

class Instance {
  constructor(instance) {
    this.id = instance.id;
    this.path = Path.join(config.paths.instances, instance.id);
    this.instance = instance;
    this.status = 'starting';
    this.finish = this.finish.bind(this);
    this.stream = null;
    this.io = null;
    this.rcon = {
      service: null,
      tryingConnection: false,
    };
    this.checker = {
      lastRun: 0,
      interval: null,
    };
    this.synchronizer = { // Update instance details
      interval: null,
      history: [],
    };
    this.sending = false; // A details report is in flight
    this.disk = { // Cached disk usage (MB) to avoid measuring every cycle
      value: null,
      measuredAt: 0,
    };
    this.buffer = '';
    this.truncatedLine = false;
    this.historyBytes = 0;
  }

  static cleanLine(raw) {
    // eslint-disable-next-line no-control-regex
    const noAnsi = raw.replace(/\x1B\[[0-9;]*[A-Za-z]/g, '');

    // Strip binary/non-printable bytes (Docker multiplexed stream frame header, etc.)
    // eslint-disable-next-line no-control-regex
    const noBinary = noAnsi.replace(/[\x00-\x08\x0B-\x1F\x7F]/g, '');

    // Strip Minecraft log prefix: [HH:MM:SS INFO]: or [HH:MM:SS] [Thread/INFO]:
    const noPrefix = noBinary.replace(
      /^\[\d{2}:\d{2}:\d{2}(?:\s+[\w/]+)?\](?:\s*\[[^\]]+\])*:\s*/,
      '',
    );

    // Strip console prompt artifact "> "
    return noPrefix.replace(/^>\s*/, '').trim();
  }

  queueHistory(message) {
    const { history } = this.synchronizer;
    history.push(message);

    this.historyBytes += Buffer.byteLength(JSON.stringify(message)) + 1;

    while (history.length > config.console.maxPendingLines
      || this.historyBytes > config.console.maxHistoryBytes) {
      this.historyBytes -= Buffer.byteLength(JSON.stringify(history.shift())) + 1;
    }
  }

  async processStreamOutput(chunk, callback) {
    try {
      // Split bounded pieces only. A single line may span unlimited Docker chunks.
      for (let offset = 0; offset < chunk.length; offset += 4096) {
        const piece = chunk.slice(offset, offset + 4096).toString('utf8');
        const parts = piece.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
        for (let index = 0; index < parts.length; index += 1) {
          const remaining = config.console.maxLineChars - this.buffer.length;
          this.buffer += parts[index].slice(0, remaining);
          if (parts[index].length > remaining) this.truncatedLine = true;
          if (index === parts.length - 1) continue;

          const raw = this.buffer + (this.truncatedLine ? ' [truncated]' : '');
          this.buffer = '';
          this.truncatedLine = false;
          const message = Instance.cleanLine(raw);
          if (!message || /^[.\s]+$/.test(message)) continue;

          this.queueHistory(message);
          // Slow/disconnected transports must not accumulate an unbounded log queue.
          if (this.io) this.io.to(`instance:${this.id}`).volatile.emit('instance-output', message);
          if (callback) callback(message);

          // eslint-disable-next-line no-console
          if (config.app.stage === 'DEV') console.log(message);
        }
      }
    } catch (err) {
      logger.error({ err }, 'Error to handle container message');
    }
  }

  // Catch stream output
  async listenStreamEvents(callback, options = {}) {
    try {
      if (this.stream) return;

      const container = await Container.get(this.id);
      this.stream = await container.attach({
        ...options,
        stream: true,
        stdin: true,
        stdout: true,
        stderr: true,
      });
      this.stream.setEncoding('utf8');

      // Define stream events
      this.stream.on('data', (chunk) => this.processStreamOutput(chunk, callback));
      this.stream.once('end', this.finish);
      this.stream.once('close', this.finish);
      this.stream.once('error', this.finish);

      container.wait().then(this.finish).catch((err) => {
        if (err.statusCode === 404) return this.finish();
        logger.error({ err }, 'Error waiting for container to stop');
        return undefined;
      });
    } catch (err) {
      logger.error({ err }, 'Error to listen container');
    }
  }

  async initRcon(port, password, callback) {
    try {
      if (!!this.rcon.service && !this.rcon.tryingConnection) return;

      this.rcon.tryingConnection = true;

      const containerIpAddress = await Container.getIpAddress(this.id);
      const rcon = await Rcon.connect({
        host: containerIpAddress,
        port,
        password,
      });

      this.rcon.service = rcon;
      this.rcon.tryingConnection = false;
      await callback();
    } catch (err) {
      this.rcon.service = null;
      this.rcon.tryingConnection = false;
    }
  }

  async sendRcon(command) {
    let sent = false;
    let result = '';

    try {
      if (this.rcon.service) {
        result = await this.rcon.service.send(command);
        sent = true;
      } else {
        sent = false;
      }
    } catch (err) {
      logger.error({ err }, `Error to emit ${command}`);

      sent = false;
    }

    return { sent, result };
  }

  async sendCommand(command) {
    try {
      const { sent, result } = await this.sendRcon(command);

      if (sent) {
        // RCON replies don't go through stdout, so push the response to the console
        for (const line of result.split(/\r\n|\r|\n/)) {
          const raw = line.slice(0, config.console.maxLineChars) + (line.length > config.console.maxLineChars ? ' [truncated]' : '');

          const message = Instance.cleanLine(raw);
          if (!message) continue;

          this.queueHistory(message);
          if (this.io) this.io.to(`instance:${this.id}`).emit('instance-output', message);
        }
      } else if (this.stream && !this.stream.destroyed) {
        // Fallback to stdin; the container echoes the result via stdout
        this.stream.write(`${command}\r\n`);
      }
    } catch (err) {
      logger.error({ err }, 'Error to send command');
    }
  }

  async measureDiskUsage() {
    const now = Date.now();
    // Re-measure at most once per minute; reuse the cached value otherwise.
    if (this.disk.value !== null && now - this.disk.measuredAt < 60000) {
      return this.disk.value;
    }

    const sizeMb = await File.getDirSize(this.path);
    this.disk.value = Math.ceil(sizeMb);
    this.disk.measuredAt = now;

    return this.disk.value;
  }

  async sendInstanceDetails() {
    if (this.suppressReports) return undefined;
    if (this.sending) return this.reportPromise;
    this.reportPromise = this.flushInstanceDetails();

    return this.reportPromise;
  }

  async flushInstanceDetails() {
    this.sending = true;
    let sending;
    let delivered = false;

    try {
      const diskUsage = await this.measureDiskUsage();
      // Detach the batch: bounded ingestion can evict old lines while I/O awaits.
      // Removing a prefix from the live queue afterwards would drop new lines.
      sending = this.synchronizer.history;
      this.synchronizer.history = [];
      this.historyBytes = 0;

      // Send all pending lines in this cycle, without waiting to fill a batch.
      delivered = await Manager.sendInstanceDetails(this.id, {
        status: this.status,
        history: sending,
        diskUsage,
      });
    } catch (err) {
      logger.error({ err }, 'Error to send instance details');
    } finally {
      if (sending && !delivered) {
        const pending = [...sending, ...this.synchronizer.history];
        this.synchronizer.history = [];
        this.historyBytes = 0;
        pending.forEach((message) => this.queueHistory(message));
      }
      this.sending = false;
    }
  }

  async start() {
    await Container.run(this.id);

    const container = await Container.get(this.id);
    const info = await container?.inspect();

    if (!info?.State.Running) throw new Error('Container did not start');

    this.status = 'running';
    try {
      this.io = getIO();
    } catch (err) {
      this.io = null;
    }
  }

  async finish() {
    try {
      if (!this || this.finishing) return;
      this.finishing = true;
      this.status = 'stopped';

      // remove stream
      if (this?.stream) {
        this.stream.removeAllListeners();
        this.stream = null;
      }

      // remove check interval
      const checkerInterval = this?.checker?.interval;
      if (checkerInterval) clearInterval(checkerInterval);

      // remove manager interval
      const synchronizerInterval = this?.synchronizer?.interval;
      if (synchronizerInterval) clearInterval(synchronizerInterval);

      if (this.suppressReports) return;

      // Finish the active report before sending the last pending lines.
      await this.reportPromise;
      await this.sendInstanceDetails();

      delete this;
    } catch (err) {
      logger.error({ err }, 'Error to finish instance');
    }
  }
}

export default Instance;
