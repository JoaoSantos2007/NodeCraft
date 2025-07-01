/* eslint-disable no-new */
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import shell from 'shelljs';
import { Op } from 'sequelize';
import AdmZip from 'adm-zip';
import {
  INSTANCES_PATH, INSTANCES, MIN_PORT, MAX_PORT,
} from '../../config/settings.js';
import { Instance as Model, Player as PlayerModel } from '../models/index.js';
import { BadRequest } from '../errors/index.js';
import Temp from './Temp.js';
import AccessGuard from './AccessGuard.js';
import Manager from './InstanceManager.js';
import download from '../utils/download.js';
import List from './List.js';

class Instance {
  constructor(doc, type = null) {
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
    // Create instance in the Database
    const instance = await Model.create({
      owner: userId,
      ...data,
    });

    // Create instance path in the System
    mkdirSync(`${INSTANCES_PATH}/${instance.id}`);

    return Instance.attributePort(instance.id);
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

  static async install(instance, force = false) {
    // Verify if instance needUpdates
    const info = await Manager.verifyNeedUpdate(instance);
    if (!info.needUpdate && !force) return { version: info.version, updated: false };

    // Define variables for download process
    const instancePath = `${INSTANCES_PATH}/${instance.id}`;
    const tempPath = Temp.create();
    const downloadCommand = instance.type === 'bedrock' ? `${tempPath}/bedrock.zip` : `${instancePath}/server.jar`;

    // Start the download process in the background
    download(downloadCommand, info.url).then(async () => {
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
      if (instance.run) new Instance(instance);
    });

    // Return the immediate response
    return { version: info.version, updating: true };
  }

  static stopAndWait(id) {
    return new Promise((resolve, reject) => {
      try {
        if (!Instance.verifyInProgess(id)) {
          resolve();
        } else {
          INSTANCES[id].stop();

          // Declare timeout variable
          let timeout;

          // Verify periodically if instance is in progress
          const interval = setInterval(() => {
            if (!Instance.verifyInProgess(id)) {
              clearInterval(interval);
              clearTimeout(timeout);
              resolve();
            }
          }, 500);

          // Set a timeout to reject the promise after 20 seconds
          timeout = setTimeout(() => {
            clearInterval(interval);
            reject(new Error('Timeout: Instance did not stop within 20 seconds.'));
          }, 20000); // 20 seconds
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  static closeInstance(id) {
    if (this.doc) this.doc.update({ running: false });
    INSTANCES[id] = null;
  }

  static async attributePort(id) {
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

    // Update instance port
    const instance = await Instance.update(id, { port: randomPort });
    return instance;
  }

  run() {
    let startCMD;
    this.doc.update({ running: true });

    if (this.type === 'bedrock') {
      startCMD = 'chmod +x bedrock_server && ./bedrock_server';
    } else if (this.type === 'java') {
      startCMD = 'java -jar server.jar nogui';
      writeFileSync(`${this.path}/eula.txt`, 'eula=true', 'utf8');
    }

    INSTANCES[this.doc.id] = this;
    this.terminal = shell.exec(`cd ${this.path} && ${startCMD}`, { silent: false, async: true });
  }

  async setup() {
    List.sync(this.path, this.doc);
    AccessGuard.wipe(this);
    this.run();
    this.setListeners();
  }

  setListeners() {
    this.terminal.on('close', () => Instance.closeInstance(this.doc.id));
    this.terminal.on('error', () => Instance.closeInstance(this.doc.id));
    this.terminal.stdout.on('data', (output) => {
      this.updateHistory(output);
      AccessGuard.analyzer(output, this);
    });
  }

  stop() {
    if (this.doc) this.doc.update({ running: false });
    this.emitEvent('stop');
    this.emitEvent('/stop');
  }

  emitEvent(cmd) {
    if (this.terminal) this.terminal.stdin.write(`${cmd}\n`);
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
