/* eslint-disable consistent-return */
/* eslint-disable no-new */
import {
  mkdirSync, rmSync, writeFileSync, chmodSync,
  existsSync,
} from 'fs';
import { spawn } from 'child_process';
import { Op } from 'sequelize';
import AdmZip from 'adm-zip';
import {
  INSTANCES_PATH, INSTANCES, MIN_PORT, MAX_PORT,
} from '../../config/settings.js';
import { Instance as Model, Player as PlayerModel } from '../models/index.js';
import { BadRequest } from '../errors/index.js';
import Temp from './Temp.js';
import AccessGuard from './AccessGuard.js';
import download from '../utils/download.js';
import List from './List.js';
import getVersion from '../utils/getVersion.js';

class Instance {
  constructor(doc, type = null) {
    this.id = doc.id;
    this.doc = doc;
    this.type = type || doc.type;
    this.path = `${INSTANCES_PATH}/${doc.id}`;
    this.online = 0;
    this.admins = 0;
    this.players = [];
    this.started = false;
    this.setup();
  }

  static async create(data, userId) {
    // Pick up a server port
    const port = await Instance.SelectPort();

    // Create instance in the Database
    const instance = await Model.create({
      owner: userId,
      port,
      ...data,
    });

    // Create instance path in the System
    mkdirSync(`${INSTANCES_PATH}/${instance.id}`);

    return instance;
  }

  static async readAll() {
    const instances = await Model.findAll({ include: { model: PlayerModel, as: 'players' } });
    return instances;
  }

  static async readOne(id) {
    const instance = await Model.findByPk(id, { include: { model: PlayerModel, as: 'players' } });
    if (!instance) throw new BadRequest('Instance not found!');

    return instance;
  }

  static async readAllByOwner(ownerId) {
    const instances = await Model.findAll({
      where: {
        owner: ownerId,
      },
    });

    return instances;
  }

  static async readAllByOwners(ownerIds) {
    const instances = await Model.findAll({
      where: {
        owner: {
          [Op.in]: ownerIds,
        },
      },
    });

    return instances;
  }

  static async update(id, data) {
    const instance = await Instance.readOne(id);
    await instance.update(data);

    return instance;
  }

  static async delete(id) {
    const instance = await Instance.readOne(id);
    await instance.destroy();
    rmSync(`${INSTANCES_PATH}/${id}`, { recursive: true });

    return instance;
  }

  static verifyInProgess(id) {
    return INSTANCES[id];
  }

  static async verifyNeedUpdate(instance) {
    const info = {
      needUpdate: false, version: 0, build: 0, url: null,
    };

    if (instance.type === 'bedrock') {
      const { version = '', url = '' } = await getVersion('bedrock');

      info.version = version;
      info.url = url;
    } if (instance.type === 'java') {
      const {
        version = '', build = 0, url = '',
      } = await getVersion(instance.software);

      info.version = version;
      info.build = build;
      info.url = url;
    }

    // Verify if instance needs updates
    info.needUpdate = instance.version !== info.version;
    if (!info.needUpdate && info.build) {
      info.needUpdate = Number(instance.build) !== Number(info.build);
    }
    if (!instance.installed) info.needUpdate = true;

    return info;
  }

  static async install(instance, force = false) {
    // Verify if instance needUpdates
    const info = await Instance.verifyNeedUpdate(instance);
    if (!info.needUpdate && !force) return { version: info.version, updated: false };

    // Define variables for download process
    const instancePath = `${INSTANCES_PATH}/${instance.id}`;
    const tempPath = Temp.create();
    const downloadCommand = instance.type === 'bedrock' ? `${tempPath}/bedrock.zip` : `${instancePath}/server.jar`;

    // Start the download process in the background
    download(downloadCommand, info.url).then(async () => {
      // Verify if the instance will need restart
      const needRestart = instance.running;

      // Stop and Wait Instance for update
      await Instance.stopAndWait(instance.id);

      // Extract installer.zip if instance is bedrock type
      if (instance.type === 'bedrock') {
        const zip = new AdmZip(`${tempPath}/bedrock.zip`);
        zip.extractAllTo(instancePath, true);
        Temp.delete(tempPath);
      }

      // Update instance data
      await Instance.update(instance.id, {
        version: info.version,
        build: info.build,
        installed: true,
      });

      // Restart instance if necessary
      if (needRestart) new Instance(instance);
    });

    // Return the immediate response
    return { version: info.version, updating: true };
  }

  static async SelectPort() {
    const instances = await Instance.readAll();
    const usedPorts = [];
    const availablePorts = [];

    // Find used ports
    instances.forEach((instance) => {
      const serverPort = instance.port;

      if (!usedPorts.includes(serverPort) && !!serverPort) usedPorts.push(serverPort);
    });

    // Find available ports
    for (let port = MIN_PORT; port <= MAX_PORT; port += 1) {
      if (!usedPorts.includes(port)) {
        availablePorts.push(port);
      }
    }

    // Abort if no port available
    if (availablePorts.length === 0) throw new Error('No port available!');

    // Pick a freedom port
    const randomIndex = Math.floor(Math.random() * availablePorts.length);
    const randomPort = availablePorts[randomIndex];

    return randomPort;
  }

  static stopAndWait(id) {
    return new Promise((resolve, reject) => {
      let resolved = false;

      function safeResolve() {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      }

      Instance.readOne(id)
        .then((data) => {
          const instance = data.get({ plain: true });
          const pid = instance?.pid;

          if (!pid || pid === 0 || !instance.running) return safeResolve();

          // Verify if process is alive
          try {
            if (pid) process.kill(pid, 0); // Test if process is alive
          } catch {
            return safeResolve(); // Process already dead
          }

          // Kill process safetly
          try {
            if (pid) process.kill(pid, 'SIGTERM'); // Try to kill process
          } catch (err) {
            return safeResolve(); // Process already dead
          }

          // Check if the process is dead periodically in 1s
          let timeout;
          const interval = setInterval(() => {
            try {
              if (pid) process.kill(pid, 0); // Test if process is alive
            } catch { // Process is dead, finish interval
              clearInterval(interval);
              clearTimeout(timeout);
              return safeResolve();
            }
          }, 1000);

          // Force kill a process after 20s
          timeout = setTimeout(() => {
            try {
              if (pid) process.kill(pid, 'SIGKILL');
            } catch (err) {
              return safeResolve();
            }
            clearInterval(interval);
            safeResolve();
          }, 20000);
        })
        .catch((err) => reject(err));
    });
  }

  async setup() {
    List.sync(this.path, this.doc);
    AccessGuard.wipe(this);
    this.run();
    this.setListeners();
  }

  run() {
    let command;
    let args;

    if (this.type === 'bedrock') {
      if (existsSync(`${this.path}/bedrock_server`)) chmodSync(`${this.path}/bedrock_server`, 0o755);
      command = './bedrock_server';
      args = [];
    } else if (this.type === 'java') {
      command = 'java';
      args = ['-jar', 'server.jar', 'nogui'];
      writeFileSync(`${this.path}/eula.txt`, 'eula=true', 'utf8');

      rmSync(`${this.path}/world/session.lock`, { recursive: true });
    }

    INSTANCES[this.doc.id] = this;
    this.terminal = spawn(command, args, {
      cwd: this.path,
      stdio: 'pipe',
      detached: false,
    });
    Instance.update(this.id, { pid: this.terminal.pid, running: true });
  }

  setListeners() {
    this.terminal.on('close', () => this.stop(true));
    this.terminal.on('error', () => this.stop(true));
    this.terminal.stdout.on('data', (output) => {
      const msg = output.toString();
      console.log(msg);
      this.updateHistory(msg);
      AccessGuard.analyzer(msg, this);
    });
  }

  emitEvent(cmd) {
    if (this.terminal && this.terminal.stdin && this.terminal.stdin.writable) this.terminal.stdin.write(`${cmd}\n`);
  }

  stop(ended = false) {
    if (ended === false) {
      this.emitEvent('stop');
      this.emitEvent('/stop');

      setTimeout(() => {
        if (this.terminal && this.terminal.exitCode === null && !this.terminal.killed) this.terminal.kill('SIGKILL');
      }, 10000);
    } else if (ended === true && this.doc) {
      Instance.update(this.id, { pid: 0, running: false });
      INSTANCES[this.id] = null;
    }
  }

  async updateHistory(output) {
    const instance = await Instance.readOne(this.doc.id);

    let msg = output;
    let { history } = instance;

    if (!msg.endsWith('\n')) msg += '\n';
    history += msg;

    // Verify and slice old lines
    const lines = history.split('\n');
    if (lines.length > instance.maxHistory) {
      const trimmedLines = lines.slice(lines.length - instance.maxHistory);
      history = trimmedLines.join('\n');
    }

    await instance.update({ history });
  }
}

export default Instance;
