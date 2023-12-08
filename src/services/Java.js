import shell from 'shelljs';
import { randomUUID } from 'crypto';
import { writeFileSync, existsSync } from 'fs';
import { INSTANCES_PATH, TEMPORARY_PATH } from '../utils/env.js';
import { BadRequest } from '../errors/index.js';
import curl from '../utils/curl.js';
import getNodeCraftObj from '../utils/getNodeCraftObj.js';
import getLatestMinecraftVersion from '../utils/getLatestMinecraftVersion.js';

class Java {
  static async create(data) {
    // Create Temp path
    const tempPath = `${TEMPORARY_PATH}/${randomUUID()}`;
    shell.mkdir(tempPath);

    // Get Minecraft Java Download Url
    shell.touch(`${tempPath}/version.html`);
    shell.exec(`${curl()} -o ${tempPath}/version.html https://www.minecraft.net/en-us/download/server`, { silent: true });
    const DownloadURL = shell.exec(`grep -o 'https://piston-data.mojang.com/v1/objects/[^"]*' ${tempPath}/version.html`, { silent: true }).stdout;

    // Create New Instance Path
    const id = randomUUID();
    const newInstancePath = `${INSTANCES_PATH}/${id}`;
    shell.mkdir(newInstancePath);

    // Download Minecraft server.jar
    const DownloadFile = 'server.jar';
    shell.exec(`${curl()} -o ${newInstancePath}/${DownloadFile} ${DownloadURL}`, { silent: true });

    // Delete temp path
    shell.rm('-r', tempPath);

    // First Run
    shell.exec(`cd ${newInstancePath} && java -jar server.jar nogui`, { silent: true });

    // Enable eula.txt
    writeFileSync(`${newInstancePath}/eula.txt`, 'eula=true');

    // Create NodeCraft settings json
    const version = await getLatestMinecraftVersion('java');
    const settings = getNodeCraftObj(newInstancePath, id, version, data);
    const json = JSON.stringify(settings);
    writeFileSync(`${newInstancePath}/nodecraft.json`, json, 'utf-8');

    return settings;
  }

  static async updateVersion(instance) {
    const instancePath = `${INSTANCES_PATH}/${instance.id}`;

    // Compare Instance Version with Latest Version
    const latestVersion = await getLatestMinecraftVersion('java');
    if (latestVersion === instance.version) return false;

    // Create Temp path
    const tempPath = `${TEMPORARY_PATH}/${randomUUID()}`;
    shell.mkdir(tempPath);

    // Get Minecraft Java Download Url
    shell.touch(`${tempPath}/version.html`);
    shell.exec(`${curl()} -o ${tempPath}/version.html https://www.minecraft.net/en-us/download/server`, { silent: true });
    const DownloadURL = shell.exec(`grep -o 'https://piston-data.mojang.com/v1/objects/[^"]*' ${tempPath}/version.html`, { silent: true }).stdout;

    // Download Minecraft server.jar
    const DownloadFile = 'server.jar';
    shell.exec(`${curl()} -o ${instancePath}/${DownloadFile} ${DownloadURL}`, { silent: true });

    // eslint-disable-next-line no-param-reassign
    instance.version = latestVersion;
    const json = JSON.stringify(instance);
    writeFileSync(`${instancePath}/nodecraft.json`, json, 'utf-8');

    shell.rm('-r', tempPath);
    return true;
  }

  static async downloadWorld(instance) {
    const worldPath = `${INSTANCES_PATH}/${instance.id}/world`;
    if (!existsSync(worldPath)) throw new BadRequest('World path not found!');

    const zipFile = `${worldPath}/world.zip`;
    shell.exec(`cd ${worldPath} && zip -rFS ${zipFile} .`, { silent: true });

    return zipFile;
  }

  static async uploadWorld(instance, uploadPath) {
    const uploadFile = `${uploadPath}/upload.zip`;
    const world = `${INSTANCES_PATH}/${instance.id}/world`;
    if (existsSync(world)) shell.rm('-r', world);

    shell.exec(`unzip -o ${uploadFile} -d ${world}`, { silent: true });
    shell.rm('-r', uploadPath);

    return instance;
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
}

export default Java;
