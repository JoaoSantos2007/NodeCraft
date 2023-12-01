import shell from 'shelljs';
import crypto from 'crypto';
import fs from 'fs';
import BadRequestError from '../errors/BadRequest.js';
import curl from '../utils/curl.js';
import { INSTANCES_PATH, TEMPORARY_PATH } from '../utils/env.js';
import Instance from './Instance.js';
import getNodeCraftObj from '../utils/getNodeCraftObj.js';

class Bedrock {
  static async create(data) {
    // Create Temp path
    const tempPath = `${TEMPORARY_PATH}/${crypto.randomUUID()}`;
    shell.mkdir(tempPath);

    // Get Minecraft Bedrock Download Url
    shell.touch(`${tempPath}/version.html`);
    shell.exec(`${curl()} -o ${tempPath}/version.html https://minecraft.net/en-us/download/server/bedrock/`, { silent: true });
    const DownloadURL = shell.exec(`grep -o 'https://minecraft.azureedge.net/bin-linux/[^"]*' ${tempPath}/version.html`, { silent: true }).stdout;
    // Download Minecraft Bedrock .zip
    const DownloadFile = 'bedrock-server-latest.zip';
    shell.exec(`${curl()} -o ${tempPath}/${DownloadFile} ${DownloadURL}`, { silent: true });

    // Create New Instance Path
    const id = crypto.randomUUID();
    const newInstancePath = `${INSTANCES_PATH}/${id}`;
    shell.mkdir(newInstancePath);

    // Unzip File
    shell.exec(`unzip ${tempPath}/${DownloadFile} -d ${newInstancePath}`, { silent: true });

    // Delete temp path
    shell.rm('-r', tempPath);

    // Create NodeCraft settings json
    const version = this.extractVersionFromUrl(DownloadURL);
    const settings = getNodeCraftObj(newInstancePath, id, version, data);
    const json = JSON.stringify(settings);
    fs.writeFileSync(`${newInstancePath}/nodecraft.json`, json, 'utf-8');

    return settings;
  }

  static updateObject(instance, obj) {
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object') {
        Bedrock.updateObject(instance[key], value);
      } else {
        instance[key] = value;
      }
    }

    return instance;
  }

  // Revisar
  static async update(id, data) {
    const instance = await Instance.readOne(id);
    const settings = Bedrock.updateObject(instance, data);

    const json = JSON.stringify(settings);
    fs.writeFileSync(`${INSTANCES_PATH}/${id}/nodecraft.json`, json, 'utf-8');

    return settings;
  }

  static extractVersionFromUrl(url) {
    // Encontra a parte da URL que contém a versão
    const partsOfUrl = url.split('/');
    const lastPart = partsOfUrl[partsOfUrl.length - 1];

    // Remove a extensão .zip
    const archiveName = lastPart.split('.zip')[0];

    // Separa a versão do restante do nome do arquivo
    const partsOfName = archiveName.split('-');
    const version = partsOfName[partsOfName.length - 1];

    return version;
  }

  static async generateWorldZip(id) {
    const instance = await Bedrock.readOne(id);

    const worldPath = `${INSTANCES_PATH}/${id}/worlds`;
    const worldName = instance.properties['level-name'];
    if (!fs.existsSync(worldPath)) throw new BadRequestError('World path not found!');
    if (!fs.existsSync(`${worldPath}/${worldName}`)) throw new BadRequestError('World not found!');

    shell.exec(`cd ${worldPath} && zip -r world.mcworld ${worldName}`, { silent: true });
    const zipFile = `${worldPath}/world.mcworld`;

    return zipFile;
  }

  static async uploadWorld(id, uploadPath) {
    const instance = await Bedrock.readOne(id);

    const uploadFile = `${uploadPath}/upload.mcworld`;
    const worldPath = `${INSTANCES_PATH}/${id}/worlds`;
    const worldName = instance.properties['level-name'];
    if (!fs.existsSync(worldPath)) throw new BadRequestError('World path not found!');

    shell.exec(`unzip -o ${uploadFile} -d ${worldPath}/${worldName}`, { silent: true });
    shell.rm('-r', uploadPath);

    return instance;
  }
}

export default Bedrock;
