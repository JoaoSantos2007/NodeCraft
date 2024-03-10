import {
  existsSync, rmSync, writeFileSync,
} from 'fs';
import shell from 'shelljs';
import { INSTANCES_PATH } from '../utils/env.js';
import { BadRequest } from '../errors/index.js';
import NodeCraft from './NodeCraft.js';
import Temp from './Temp.js';
import {
  Paper, Purpur, Vanilla, Forge,
} from '../softwares/index.js';
import { syncPropertiesLists } from '../utils/Properties.js';
import Instance from './Instance.js';
import findPlayer from '../utils/findPlayer.js';
import formatUUID from '../utils/formatUUID.js';

class Java extends Instance {
  constructor(settings) {
    super(settings, 'java');
    this.setup();
  }

  static async create(id, software = 'vanilla', version = null) {
    const instancePath = `${INSTANCES_PATH}/${id}`;
    let info = { version, build: null };

    switch (software) {
      case 'paper':
        info = await Paper.install(instancePath, version);
        break;
      case 'purpur':
        info = await Purpur.install(instancePath, version);
        break;
      case 'forge':
        info = await Forge.install(instancePath, version);
        break;
      default:
        info = await Vanilla.install(instancePath);
    }

    // First Run and Agree With eula.txt
    shell.exec(`cd ${instancePath} && java -jar forge.jar --installServer nogui`, { silent: true });
    writeFileSync(`${instancePath}/eula.txt`, 'eula=true');

    return NodeCraft.create(id, info.version, 'java', software, info.build);
  }

  static async update(instance) {
    let info = { version: instance.version, build: instance.build, updated: false };

    switch (instance.software) {
      case 'paper':
        info = await Paper.update(instance);
        break;
      case 'purpur':
        info = await Purpur.update(instance);
        break;
      case 'forge':
        info = await Forge.update(instance);
        break;
      default:
        info = await Vanilla.update(instance);
    }

    const instanceUpdated = instance;
    instanceUpdated.version = info.version;
    instanceUpdated.build = info.build;
    NodeCraft.save(instanceUpdated);

    return info;
  }

  static async downloadWorld(instance, worldType = null) {
    const instancePath = `${INSTANCES_PATH}/${instance.id}`;
    let worldPath = `${instancePath}/world`;
    let zipName = 'world';

    if (worldType) {
      if (worldType.toLowerCase() === 'nether') {
        worldPath = `${instancePath}/world_nether`;
        zipName = 'world_nether';
      } else if (worldType.toLowerCase() === 'end') {
        worldPath = `${instancePath}/world_the_end`;
        zipName = 'world_the_end';
      }
    }

    if (!existsSync(worldPath)) throw new BadRequest('World path not found!');

    const zipFile = `${worldPath}/${zipName}.zip`;
    // Zip world path
    shell.exec(`cd ${worldPath} && zip -rFS ${zipFile} .`, { silent: true });

    return zipFile;
  }

  static async uploadWorld(instance, uploadPath, worldType = null) {
    const instancePath = `${INSTANCES_PATH}/${instance.id}`;
    let world = `${instancePath}/world`;
    const uploadFile = `${uploadPath}/upload.zip`;

    if (worldType) {
      if (worldType.toLowerCase() === 'nether') {
        world = `${instancePath}/world_nether`;
      } else if (worldType.toLowerCase() === 'end') {
        world = `${instancePath}/world_the_end`;
      }
    }
    if (existsSync(world)) rmSync(world, { recursive: true });

    // Unzip uploaded world
    shell.exec(`unzip -o ${uploadFile} -d ${world}`, { silent: true });
    Temp.delete(uploadPath);

    return instance;
  }

  static async deleteWorld(instance, worldType = null) {
    const instancePath = `${INSTANCES_PATH}/${instance.id}`;
    let world = `${instancePath}/world`;

    if (worldType) {
      if (worldType.toLowerCase() === 'nether') {
        world = `${instancePath}/world_nether`;
      } else if (worldType.toLowerCase() === 'end') {
        world = `${instancePath}/world_the_end`;
      }
    }

    if (existsSync(world)) rmSync(world, { recursive: true });
  }

  async setup() {
    syncPropertiesLists(this.path, this.settings);
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
