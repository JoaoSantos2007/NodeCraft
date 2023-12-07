import shell from 'shelljs';
import { randomUUID } from 'crypto';
import { writeFileSync, existsSync } from 'fs';
import { BadRequest } from '../errors/index.js';
import { INSTANCES_PATH, TEMPORARY_PATH } from '../utils/env.js';
import curl from '../utils/curl.js';
import getNodeCraftObj from '../utils/getNodeCraftObj.js';
import getLatestMinecraftVersion from '../utils/getLatestMinecraftVersion.js';

class Bedrock {
  static async create(data) {
    // Create Temp path
    const tempPath = `${TEMPORARY_PATH}/${randomUUID()}`;
    shell.mkdir(tempPath);

    // Get Minecraft Bedrock Download Url
    shell.touch(`${tempPath}/version.html`);
    shell.exec(`${curl()} -o ${tempPath}/version.html https://minecraft.net/en-us/download/server/bedrock/`, { silent: true });
    const DownloadURL = shell.exec(`grep -o 'https://minecraft.azureedge.net/bin-linux/[^"]*' ${tempPath}/version.html`, { silent: true }).stdout;
    // Download Minecraft Bedrock .zip
    const DownloadFile = 'bedrock-server-latest.zip';
    shell.exec(`${curl()} -o ${tempPath}/${DownloadFile} ${DownloadURL}`, { silent: true });

    // Create New Instance Path
    const id = randomUUID();
    const newInstancePath = `${INSTANCES_PATH}/${id}`;
    shell.mkdir(newInstancePath);

    // Unzip File
    shell.exec(`unzip ${tempPath}/${DownloadFile} -d ${newInstancePath}`, { silent: true });

    // Delete temp path
    shell.rm('-r', tempPath);

    // Create NodeCraft settings json
    const version = await getLatestMinecraftVersion('bedrock', DownloadURL);
    const settings = getNodeCraftObj(newInstancePath, id, version, data);
    const json = JSON.stringify(settings);
    writeFileSync(`${newInstancePath}/nodecraft.json`, json, 'utf-8');

    return settings;
  }

  static async updateVersion(instance) {
    const instanceVersion = instance.version;
    const instancePath = `${INSTANCES_PATH}/${instance.id}`;

    // Create Temp path
    const tempPath = `${TEMPORARY_PATH}/${randomUUID()}`;
    shell.mkdir(tempPath);

    // Get Minecraft Bedrock Download Url
    shell.touch(`${tempPath}/version.html`);
    shell.exec(`${curl()} -o ${tempPath}/version.html https://minecraft.net/en-us/download/server/bedrock/`, { silent: true });
    const DownloadURL = shell.exec(`grep -o 'https://minecraft.azureedge.net/bin-linux/[^"]*' ${tempPath}/version.html`, { silent: true }).stdout;

    // Compare Instance Version with Latest Version
    const latestVersion = await getLatestMinecraftVersion('bedrock', DownloadURL);
    if (latestVersion === instanceVersion) {
      shell.rm('-r', tempPath);
      return false;
    }

    // Download Minecraft Bedrock .zip
    const DownloadFile = 'bedrock-server-latest.zip';
    shell.exec(`${curl()} -o ${tempPath}/${DownloadFile} ${DownloadURL}`, { silent: true });

    // Install Update
    shell.exec(`unzip -o ${tempPath}/${DownloadFile} -d ${instancePath}`, { silent: true });

    // eslint-disable-next-line no-param-reassign
    instance.version = latestVersion;
    const json = JSON.stringify(instance);
    writeFileSync(`${instancePath}/nodecraft.json`, json, 'utf-8');

    shell.rm('-r', tempPath);
    return true;
  }

  static async downloadWorld(instance) {
    const worldPath = `${INSTANCES_PATH}/${instance.id}/worlds`;
    const worldName = instance.properties['level-name'];
    if (!existsSync(worldPath)) throw new BadRequest('World path not found!');
    if (!existsSync(`${worldPath}/${worldName}`)) throw new BadRequest('World not found!');

    const zipFile = `${worldPath}/world.mcworld`;
    shell.exec(`cd ${worldPath}/${worldName} && zip -rFS ${zipFile} .`, { silent: true });

    return zipFile;
  }

  static async uploadWorld(instance, uploadPath) {
    const uploadFile = `${uploadPath}/upload.zip`;
    const worldsPath = `${INSTANCES_PATH}/${instance.id}/worlds`;
    if (!existsSync(worldsPath)) shell.mkdir(worldsPath);

    const worldName = instance.properties['level-name'];
    const world = `${worldsPath}/${worldName}`;
    if (existsSync(world)) shell.rm('-r', world);

    shell.exec(`unzip ${uploadFile} -d ${world}`, { silent: true });
    shell.rm('-r', uploadPath);

    return instance;
  }
}

export default Bedrock;
