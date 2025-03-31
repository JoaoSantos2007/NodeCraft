import { mkdirSync, rmSync } from 'fs';
import shell from 'shelljs';
import { Op } from 'sequelize';
import { INSTANCES_PATH, INSTANCES } from '../../config/settings.js';
import { Instance as Model, Player as PlayerModel } from '../models/index.js';
import { BadRequest } from '../errors/index.js';

class Instance {
  constructor(doc, type = null) {
    this.doc = doc;
    this.type = type || doc.type;
    this.path = `${INSTANCES_PATH}/${doc.id}`;
    this.online = 0;
    this.admins = 0;
    this.players = [];
    this.isDone = false;
  }

  static async create(data, userId) {
    // Create instance in the Database
    const instance = await Model.create({
      owner: userId,
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

  run() {
    this.doc.update({ running: true });
    const startCMD = this.type === 'bedrock' ? 'chmod +x bedrock_server && ./bedrock_server' : 'java -jar server.jar nogui';

    INSTANCES[this.doc.id] = this;
    this.terminal = shell.exec(`cd ${this.path} && ${startCMD}`, { silent: false, async: true });
    this.setListeners();
  }

  setListeners() {
    this.terminal.on('close', () => Instance.closeInstance(this.doc.id));
    this.terminal.on('error', () => Instance.closeInstance(this.doc.id));
  }

  stop() {
    if (this.doc) this.doc.update({ running: false });
    this.emitEvent('stop');
    this.emitEvent('/stop');
  }

  emitEvent(cmd) {
    if (this.terminal) this.terminal.stdin.write(`${cmd}\n`);
  }

  readPlayers() {
    const playersValues = this.doc.players;
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
