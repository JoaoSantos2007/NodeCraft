import { mkdirSync, readdirSync, rmSync } from 'fs';
import { randomUUID } from 'crypto';
import shell from 'shelljs';
import { INSTANCES_PATH, INSTANCES } from '../../config/settings.js';
import validate from '../validators/instance.js';
import NodeCraft from './NodeCraft.js';

class Instance {
  constructor(settings, type = null) {
    this.settings = settings;
    this.type = type || settings.type;
    this.path = `${INSTANCES_PATH}/${settings.id}`;
    this.online = 0;
    this.admins = 0;
    this.players = [];
    this.startCMD = settings.startCMD;
  }

  static create(data, userId) {
    validate(data);

    const id = randomUUID();
    mkdirSync(`${INSTANCES_PATH}/${id}`);

    const settings = NodeCraft.create({ ...data, id, owner: userId });
    return settings;
  }

  static readAll() {
    const instanceList = readdirSync(INSTANCES_PATH);

    const instances = [];
    instanceList.map((id) => instances.push(NodeCraft.read(id)));

    return instances;
  }

  static readOne(id) {
    return NodeCraft.read(id);
  }

  static readAllByOwner(ownerId) {
    const instanceList = readdirSync(INSTANCES_PATH);

    const instances = [];
    instanceList.map((id) => {
      const instance = NodeCraft.read(id);
      if (instance.owner === ownerId) instances.push(instance);

      return instance;
    });

    return instances;
  }

  static readAllByOwners(ownersIds) {
    const instanceList = readdirSync(INSTANCES_PATH);

    const instances = [];
    instanceList.map((id) => {
      const instance = NodeCraft.read(id);
      if (ownersIds.includes(instance.owner) === true) instances.push(instance);

      return instance;
    });

    return instances;
  }

  static update(id, data) {
    const instance = Instance.readOne(id);
    validate(data, instance);

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(data)) instance[key] = value;
    NodeCraft.save(instance);

    return instance;
  }

  static delete(id) {
    const instance = Instance.readOne(id);
    rmSync(`${INSTANCES_PATH}/${id}`, { recursive: true });

    return instance;
  }

  static verifyInProgess(id) {
    return INSTANCES[id];
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
    INSTANCES[id] = null;
  }

  run() {
    INSTANCES[this.settings.id] = this;
    this.terminal = shell.exec(`cd ${this.path} && ${this.startCMD}`, { silent: false, async: true });
    this.setListeners();
  }

  setListeners() {
    this.terminal.on('close', () => Instance.closeInstance(this.settings.id));
    this.terminal.on('error', () => Instance.closeInstance(this.settings.id));
  }

  stop() {
    this.emitEvent('stop');
    this.emitEvent('/stop');
  }

  emitEvent(cmd) {
    if (this.terminal) this.terminal.stdin.write(`${cmd}\n`);
  }

  readPlayers() {
    const playersValues = this.settings.players;
    return Object.values(playersValues);
  }

  verifyPlayerIsAdmin(gamertag) {
    const players = this.readPlayers();
    let isAdmin = false;

    players.forEach((player) => {
      if (player.gamertag === gamertag && player.admin) isAdmin = true;
    });

    return isAdmin;
  }

  updateHistory(output) {
    const instance = NodeCraft.read(this.settings.id);
    const { history, maxHistoryLines } = instance;

    history.push(output);
    if (history.length > maxHistoryLines) {
      instance.history = history.slice(Number(history.length - maxHistoryLines));
    }

    NodeCraft.save(instance);
  }
}

export default Instance;
