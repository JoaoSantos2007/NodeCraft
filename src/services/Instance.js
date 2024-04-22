import { mkdirSync, readdirSync, rmSync } from 'fs';
import { randomUUID } from 'crypto';
import shell from 'shelljs';
import { INSTANCES_PATH } from '../utils/env.js';
import instanceValidator from '../validators/instance.js';
import NodeCraft from './NodeCraft.js';

class Instance {
  constructor(settings, type = null) {
    this.settings = settings;
    this.type = type || settings.type;
    this.path = `${INSTANCES_PATH}/${settings.id}`;
    this.online = 0;
    this.admins = 0;
    this.players = [];
  }

  static create(data) {
    instanceValidator(data);

    const id = randomUUID();
    mkdirSync(`${INSTANCES_PATH}/${id}`);
    // Criar aqui o nodecraft.json e devolver uma resposta

    return { id };
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

  static update(id, data) {
    const instance = Instance.readOne(id);
    instanceValidator(data, instance);

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

  run() {
    if (this.type === 'java') this.terminal = shell.exec(`cd ${this.path} && java -jar server.jar nogui`, { silent: false, async: true });
    else this.terminal = shell.exec(`cd ${this.path} && ./bedrock_server`, { silent: false, async: true });
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
