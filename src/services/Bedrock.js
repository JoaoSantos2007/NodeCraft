import shell from 'shelljs';
import crypto from 'crypto';
import fs from 'fs';
import BadRequestError from '../errors/BadRequest.js';
import { bedrockInstances } from '../utils/instances.js';
import curl from '../utils/curl.js';
import Propreties from '../utils/Properties.js';
import { INSTANCES_PATH, TEMPORARY_PATH } from '../utils/env.js';
import BedrockScript from '../scripts/Bedrock.js';

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
    const settings = await Bedrock.getNodeCraftSettings(newInstancePath, id, data);
    const json = JSON.stringify(settings);
    fs.writeFileSync(`${newInstancePath}/nodecraft.json`, json, 'utf-8');

    return settings;
  }

  static async readAll() {
    const instancesList = fs.readdirSync(INSTANCES_PATH);

    const instances = [];

    instancesList.map((id) => {
      const rawData = fs.readFileSync(`${INSTANCES_PATH}/${id}/nodecraft.json`, 'utf-8');
      const data = JSON.parse(rawData);
      return instances.push(data);
    });

    return instances;
  }

  static async readOne(id) {
    const filePath = `${INSTANCES_PATH}/${id}/nodecraft.json`;

    if (!fs.existsSync(filePath)) throw new BadRequestError('Instance not found!');

    const rawData = fs.readFileSync(filePath, 'utf-8');
    const instance = JSON.parse(rawData);

    return instance;
  }

  static async update(id, body) {
    const data = Bedrock.extractInstanceList(body);

    const instance = await Bedrock.readOne(id);
    await instance.update(data);

    return instance;
  }

  static async delete(id) {
    const instance = await Bedrock.readOne(id);
    shell.exec(`rm -r ${INSTANCES_PATH}/${id}`, { silent: true });

    return instance;
  }

  static async run(id) {
    const instance = await Bedrock.readOne(id);

    if (Bedrock.verifyInstanceInProgess(id)) throw new BadRequestError('Instance already is in progress');

    // Run Instance
    const bedrockInstance = new BedrockScript(instance);
    bedrockInstances[id] = bedrockInstance;

    return instance;
  }

  static async stop(id) {
    const instance = await Bedrock.readOne(id);

    if (!Bedrock.verifyInstanceInProgess(id)) throw new BadRequestError('Instance is not in progress');

    // Stop Instance
    bedrockInstances[id].stop();
    bedrockInstances[id] = null;

    return instance;
  }

  static verifyInstanceInProgess(id) {
    const bedrockInstance = bedrockInstances[id];

    return bedrockInstance;
  }

  static async getNodeCraftSettings(path, id, { name }) {
    const properties = Propreties.getPropertiesListLocal(path);

    const settings = {
      id,
      name,
      properties,
      allowlist: {},
    };

    return settings;
  }
}

export default Bedrock;
