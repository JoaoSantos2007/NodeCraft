import {
  existsSync, mkdirSync, rmSync, writeFileSync,
} from 'fs';
import shell from 'shelljs';
import { INSTANCES_PATH } from '../utils/env.js';
import { BadRequest } from '../errors/index.js';
import curl from '../utils/curl.js';
import NodeCraft from './NodeCraft.js';
import Temp from './Temp.js';

class Java {
  static async create(id) {
    const newInstancePath = `${INSTANCES_PATH}/${id}`;
    mkdirSync(newInstancePath);

    await Java.install(newInstancePath);
    // First Run
    shell.exec(`cd ${newInstancePath} && java -jar server.jar nogui`, { silent: true });
    // Agree with eula.txt
    writeFileSync(`${newInstancePath}/eula.txt`, 'eula=true');

    const version = await Java.getLatestVersion();
    const settings = NodeCraft.create(id, version, 'java');

    return settings;
  }

  static async updateVersion(instance) {
    const instancePath = `${INSTANCES_PATH}/${instance.id}`;
    const latestVersion = await Java.getLatestVersion();
    if (latestVersion === instance.version) return false;

    await Java.install(instancePath);

    // eslint-disable-next-line no-param-reassign
    instance.version = latestVersion;
    NodeCraft.save(instance);

    return true;
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

  static async getDownloadUrl() {
    const tempPath = Temp.create();

    // Get Minecraft Site Html
    shell.exec(`${curl()} -o ${tempPath}/version.html https://www.minecraft.net/en-us/download/server`, { silent: true });
    // Extract Version from Html
    const downloadUrl = shell.exec(`grep -o 'https://piston-data.mojang.com/v1/objects/[^"]*' ${tempPath}/version.html`, { silent: true }).stdout;

    Temp.delete(tempPath);

    return downloadUrl;
  }

  static async getLatestVersion() {
    const response = await fetch('https://launchermeta.mojang.com/mc/game/version_manifest.json');
    const data = await response.json();

    if (data && data.latest && data.versions) {
      const latestVersion = data.latest.release;

      // eslint-disable-next-line no-restricted-syntax
      for (const version of data.versions) {
        if (version.id === latestVersion && version.type === 'release') {
          return version.id;
        }
      }
    }

    return 0;
  }

  static async install(path, url = null) {
    const downloadUrl = url || await Java.getDownloadUrl();
    const downloadFile = 'server.jar';
    // Download server.jar
    shell.exec(`${curl()} -o ${path}/${downloadFile} ${downloadUrl}`, { silent: true });
  }
}

export default Java;
