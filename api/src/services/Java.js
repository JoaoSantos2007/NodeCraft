import { writeFileSync } from 'fs';
import { INSTANCES_PATH } from '../utils/env.js';
import NodeCraft from './NodeCraft.js';
import {
  Paper, Purpur, Vanilla, Forge,
} from '../softwares/index.js';
import { syncLists } from '../utils/Properties.js';
import Instance from './Instance.js';
import findPlayer from '../utils/findPlayer.js';
import formatUUID from '../utils/formatUUID.js';

class Java extends Instance {
  constructor(settings) {
    super(settings, 'java');
    this.setup();
  }

  static async install(instance) {
    let info = { version: instance.version, build: null };

    switch (instance.software) {
      case 'paper':
        info = await Paper.install(instance);
        break;
      case 'purpur':
        info = await Purpur.install(instance);
        break;
      case 'forge':
        info = await Forge.install(instance);
        break;
      default:
        info = await Vanilla.install(instance);
    }

    writeFileSync(`${INSTANCES_PATH}/${instance.id}/eula.txt`, 'eula=true');
    NodeCraft.update(instance.id, { version: info.version, build: info.build, installed: true });

    return info;
  }

  async setup() {
    syncLists(this.path, this.settings);
    this.updateAccess();
    this.setupOps();
    this.run();
    this.handleServerEvents();
  }

  handleServerEvents() {
    this.terminal.stdout.on('data', (data) => {
      this.updateHistory(data);
      this.verifyPlayerConnected(data);
      this.verifyPlayerDisconnected(data);
    });
  }

  async setupOps() {
    const playersValues = this.readPlayers();
    const ops = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const player of playersValues) {
      const { gamertag, operator, admin } = player;

      if (operator) {
        // eslint-disable-next-line no-await-in-loop
        const id = await findPlayer(gamertag);
        const uuid = formatUUID(id);
        if (uuid) {
          ops.push({
            uuid,
            name: gamertag,
            level: 4,
            bypassesPlayerLimit: !!admin,
          });
        }
      }
    }

    writeFileSync(`${this.path}/ops.json`, JSON.stringify(ops), 'utf8');
  }

  async updateAccess() {
    const playersValues = this.readPlayers();
    const allowlist = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const player of playersValues) {
      const { gamertag, access } = player;

      if (access === 'always' || player.admin || (access === 'monitored' && this.admins > 0)) {
        // eslint-disable-next-line no-await-in-loop
        const id = await findPlayer(gamertag);
        const uuid = formatUUID(id);
        if (uuid) allowlist.push({ uuid, name: gamertag });
      }

      if (access === 'monitored' && this.admins < 0 && this.players.includes(gamertag)) {
        this.emitEvent(`kick ${gamertag}`);
      }
    }

    writeFileSync(`${this.path}/whitelist.json`, JSON.stringify(allowlist), 'utf8');
  }

  verifyPlayerConnected(output) {
    if (output.includes('joined the game')) {
      const gamertag = output.split(' joined the game')[0].split(' ').slice(-1)[0];
      this.online += 1;
      this.players.push(gamertag);

      if (this.verifyPlayerIsAdmin(gamertag)) {
        this.admins += 1;
        this.updateAccess();
      }
    }
  }

  verifyPlayerDisconnected(output) {
    if (output.includes('left the game')) {
      const gamertag = output.split(' left the game')[0].split(' ').slice(-1)[0];
      this.online -= 1;
      this.players.splice(this.players.indexOf(gamertag), 1);

      if (this.verifyPlayerIsAdmin(gamertag)) {
        this.admins -= 1;
        this.updateAccess();
      }
    }
  }
}

export default Java;
