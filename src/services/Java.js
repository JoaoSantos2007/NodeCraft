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

class Java extends Instance {
  constructor(settings) {
    super(settings);
    this.setup();
  }

  static async create(id, software, version) {
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
    shell.exec(`cd ${instancePath} && java -jar server.jar nogui`, { silent: true });
    writeFileSync(`${instancePath}/eula.txt`, 'eula=true');

    return NodeCraft.create(id, info.version, 'java', info.build);
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

  static async downloadWorld(instance) {
    const worldPath = `${INSTANCES_PATH}/${instance.id}/world`;
    if (!existsSync(worldPath)) throw new BadRequest('World path not found!');

    const zipFile = `${worldPath}/world.zip`;
    // Zip world path
    shell.exec(`cd ${worldPath} && zip -rFS ${zipFile} .`, { silent: true });

    return zipFile;
  }

  static async uploadWorld(instance, uploadPath) {
    const uploadFile = `${uploadPath}/upload.zip`;
    const world = `${INSTANCES_PATH}/${instance.id}/world`;
    if (existsSync(world)) rmSync(world, { recursive: true });

    // Unzip uploaded world
    shell.exec(`unzip -o ${uploadFile} -d ${world}`, { silent: true });
    Temp.delete(uploadPath);

    return instance;
  }

  static async deleteWorld(instance) {
    const world = `${INSTANCES_PATH}/${instance.id}/world`;
    if (existsSync(world)) rmSync(world, { recursive: true });
  }

  setup() {
    syncPropertiesLists(this.path, this.settings);
    this.run();
    this.handleServerEvents();
  }

  run() {
    this.terminal = shell.exec(`cd ${this.path} && java -Xmx1024M -Xms1024M -jar server.jar nogui`, { silent: false, async: true });
  }

  stop() {
    this.emitEvent('/stop');
    this.emitEvent('stop');
  }

  emitEvent(cmd) {
    if (this.terminal) this.terminal.stdin.write(`${cmd}\n`);
  }

  handleServerEvents() {
    this.terminal.stdout.on('data', (data) => {
      // this.verifyPlayerConnected(data);
      // this.verifyPlayerDisconnected(data);
    });
  }
}

export default Java;
