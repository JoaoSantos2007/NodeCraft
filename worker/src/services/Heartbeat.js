import si from 'systeminformation';
import config from '../../config/config.js';
import logger from '../../config/logger.js';

const HEART_BEAT_TIME = 15000;

let pulsing = false;

class Hearbeat {
  static async define() {
    await Hearbeat.pulse();

    setInterval(async () => {
      if (pulsing) {
        logger.warn('Skipping heartbeat, previous pulse still in flight');

        return;
      }

      pulsing = true;

      try {
        await Hearbeat.pulse();
      } finally {
        pulsing = false;
      }
    }, HEART_BEAT_TIME);
  }

  static async makeData() {
    const [cpu, mem, disk] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
    ]);

    // fsSize of system root
    const rootDisk = disk.find((d) => d.mount === '/') ?? disk[0];

    // Convert bytes to MB
    const toMB = (bytes) => parseFloat((bytes / 1024 ** 2).toFixed(2));

    return {
      port: config.app.port,
      cpuUsage: parseFloat(cpu.currentLoad.toFixed(2)),
      memoryTotal: toMB(mem.total),
      memoryUsed: toMB(mem.active),
      diskAvailable: toMB(rootDisk.size - rootDisk.used),
    };
  }

  static async pulse() {
    try {
      const requestUrl = `${config.manager.url}/worker/${config.app.id}/heartbeat`;
      const info = await Hearbeat.makeData();
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.manager.apiKey}`,
      };

      const result = await fetch(requestUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(info),
        // A slow manager must not make pulses pile up on top of each other:
        // every pending request holds a database connection on the other side.
        signal: AbortSignal.timeout(config.manager.timeout),
      });

      // Release the socket: an unread body keeps the connection open.
      await result.body?.cancel();
    } catch (err) {
      logger.error({ err }, 'Error to make heartbeat');
    }
  }
}

export default Hearbeat;
