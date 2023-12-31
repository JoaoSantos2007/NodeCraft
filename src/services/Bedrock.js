import shell from 'shelljs';
import {
  existsSync, mkdirSync, readFileSync, rmSync,
} from 'fs';
import * as cheerio from 'cheerio';
import { BadRequest } from '../errors/index.js';
import { INSTANCES_PATH } from '../utils/env.js';
import NodeCraft from './NodeCraft.js';
import Temp from './Temp.js';
import download from '../utils/download.js';

class Bedrock {
  static async create(id) {
    const newInstancePath = `${INSTANCES_PATH}/${id}`;
    mkdirSync(newInstancePath);

    const version = await Bedrock.install(newInstancePath);
    return NodeCraft.create(id, version, 'bedrock');
  }

  static async update(instance) {
    const instancePath = `${INSTANCES_PATH}/${instance.id}`;

    const downloadUrl = await Bedrock.getDownloadUrl();
    const latestVersion = Bedrock.extractVersion(downloadUrl);
    if (latestVersion === instance.version) return { updated: false, version: instance.version };

    await Bedrock.install(instancePath, downloadUrl);
    const instanceUpdated = instance;
    instanceUpdated.version = latestVersion;
    NodeCraft.save(instanceUpdated);

    return { updated: true, version: latestVersion };
  }

  static async getDownloadUrl() {
    const tempPath = Temp.create();
    await download(`${tempPath}/index.html`, 'https://minecraft.net/en-us/download/server/bedrock');
    const html = readFileSync(`${tempPath}/index.html`, 'utf8');
    const $ = cheerio.load(html);

    const downloadUrl = $('a[data-platform="serverBedrockLinux"]').attr('href');
    Temp.delete(tempPath);
    return downloadUrl;
  }

  static extractVersion(url) {
    return url.split('bedrock-server-')[1].split('.zip')[0];
  }

  static async install(path, url = null) {
    const tempPath = Temp.create();
    const downloadUrl = url || await Bedrock.getDownloadUrl();

    // Install and unzip
    await download(`${tempPath}/bedrock.zip`, downloadUrl);
    shell.exec(`unzip -o ${tempPath}/bedrock.zip -d ${path}`, { silent: true });

    Temp.delete(tempPath);
    return Bedrock.extractVersion(downloadUrl);
  }

  static async downloadWorld(instance) {
    const worldPath = `${INSTANCES_PATH}/${instance.id}/worlds`;
    const worldName = instance.properties['level-name'];
    const world = `${worldPath}/${worldName}`;

    if (!existsSync(world)) throw new BadRequest('World not found!');
    const file = `${worldPath}/world.mcworld`;
    // Zip world path
    shell.exec(`cd ${world} && zip -rFS ${file} .`, { silent: true });

    return file;
  }

  static async uploadWorld(instance, uploadPath) {
    const uploadFile = `${uploadPath}/upload.zip`;
    const worldsPath = `${INSTANCES_PATH}/${instance.id}/worlds`;
    if (!existsSync(worldsPath)) mkdirSync(worldsPath);

    const worldName = instance.properties['level-name'];
    const world = `${worldsPath}/${worldName}`;
    if (existsSync(world)) rmSync(world, { recursive: true });

    // Unzip uploaded world
    shell.exec(`unzip ${uploadFile} -d ${world}`, { silent: true });
    Temp.delete(uploadPath);

    return instance;
  }

  static async deleteWorld(instance) {
    const worldsPath = `${INSTANCES_PATH}/${instance.id}/worlds`;
    if (!existsSync(worldsPath)) return;

    const worldName = instance.properties['level-name'];
    const world = `${worldsPath}/${worldName}`;
    if (existsSync(world)) rmSync(world, { recursive: true });
  }
}

export default Bedrock;
