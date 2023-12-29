import {
  existsSync, mkdirSync, rmSync, writeFileSync,
} from 'fs';
import shell from 'shelljs';
import { INSTANCES_PATH } from '../utils/env.js';
import { BadRequest } from '../errors/index.js';
import NodeCraft from './NodeCraft.js';
import Temp from './Temp.js';
import {
  Paper, Purpur, Vanilla, Forge,
} from '../softwares/index.js';

class Java {
  static async create(id, software, version) {
    const newInstancePath = `${INSTANCES_PATH}/${id}`;
    let info = { version, build: null };
    mkdirSync(newInstancePath);

    switch (software) {
      case 'paper':
        info = await Paper.install(newInstancePath, version);
        break;
      case 'purpur':
        info = await Purpur.install(newInstancePath, version);
        break;
      case 'forge':
        info = await Forge.install(newInstancePath, version);
        break;
      default:
        info = await Vanilla.install(newInstancePath);
    }

    // First Run and Agree With eula.txt
    shell.exec(`cd ${newInstancePath} && java -jar server.jar nogui`, { silent: true });
    writeFileSync(`${newInstancePath}/eula.txt`, 'eula=true');

    return NodeCraft.create(id, info.version, 'java', info.build);
  }

  static async update(instance) {
    let info = { version: instance.version, build: instance.build };

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

    return NodeCraft.save(instanceUpdated);
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
}

export default Java;
