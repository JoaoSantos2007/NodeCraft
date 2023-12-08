import { exec, touch } from 'shelljs';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { BadRequest } from '../errors/index.js';
import { INSTANCES_PATH } from '../utils/env.js';
import curl from '../utils/curl.js';
import NodeCraft from './NodeCraft.js';
import Temp from './Temp.js';

class Bedrock {
  static async create(id) {
    const newInstancePath = `${INSTANCES_PATH}/${id}`;
    mkdirSync(newInstancePath);

    const downloadUrl = await Bedrock.getDownloadUrl();
    await Bedrock.install(newInstancePath, downloadUrl);

    const version = await Bedrock.getLatestVersion(downloadUrl);
    const settings = NodeCraft.create(id, version, 'bedrock');

    return settings;
  }

  static async updateVersion(instance) {
    const instancePath = `${INSTANCES_PATH}/${instance.id}`;

    const downloadUrl = await Bedrock.getDownloadUrl();
    const latestVersion = await Bedrock.getLatestVersion(downloadUrl);

    if (latestVersion === instance.version) return false;
    await Bedrock.install(instancePath, downloadUrl);

    // eslint-disable-next-line no-param-reassign
    instance.version = latestVersion;
    NodeCraft.save(instance);

    return true;
  }

  static async downloadWorld(instance) {
    const worldPath = `${INSTANCES_PATH}/${instance.id}/worlds`;
    const worldName = instance.properties['level-name'];
    const world = `${worldPath}/${worldName}`;

    if (!existsSync(world)) throw new BadRequest('World not found!');
    const file = `${worldPath}/world.mcworld`;
    // Zip world
    exec(`cd ${world} && zip -rFS ${file} .`, { silent: true });

    return file;
  }

  static async uploadWorld(instance, uploadPath) {
    const uploadFile = `${uploadPath}/upload.zip`;
    const worldsPath = `${INSTANCES_PATH}/${instance.id}/worlds`;
    if (!existsSync(worldsPath)) mkdirSync(worldsPath);

    const worldName = instance.properties['level-name'];
    const world = `${worldsPath}/${worldName}`;
    if (existsSync(world)) rmSync(world, { recursive: true });

    exec(`unzip ${uploadFile} -d ${world}`, { silent: true });
    Temp.delete(uploadPath);

    return instance;
  }

  static async getDownloadUrl() {
    const tempPath = Temp.create();

    // Get Minecraft Bedrock Download Url
    touch(`${tempPath}/version.html`);
    exec(`${curl()} -o ${tempPath}/version.html https://minecraft.net/en-us/download/server/bedrock/`, { silent: true });
    const downloadUrl = exec(`grep -o 'https://minecraft.azureedge.net/bin-linux/[^"]*' ${tempPath}/version.html`, { silent: true }).stdout;

    Temp.delete(tempPath);

    return downloadUrl;
  }

  static async getLatestVersion(url = null) {
    const latestUrl = url || await Bedrock.getDownloadUrl();

    const partsOfUrl = latestUrl.split('/');
    const lastPart = partsOfUrl[partsOfUrl.length - 1];
    const archiveName = lastPart.split('.zip')[0];
    const partsOfName = archiveName.split('-');
    const version = partsOfName[partsOfName.length - 1];

    return version;
  }

  static async install(path, url = null) {
    const tempPath = Temp.create();
    const latestUrl = url || await Bedrock.getDownloadUrl();

    const downloadFile = 'bedrock.zip';
    // Download file
    exec(`${curl()} -o ${tempPath}/${downloadFile} ${latestUrl}`, { silent: true });

    // Install update
    exec(`unzip -o ${tempPath}/${downloadFile} -d ${path}`, { silent: true });

    Temp.delete(tempPath);
  }
}

export default Bedrock;
