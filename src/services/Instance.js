import fs from 'fs';
import instancesList from '../utils/instances.js';
import BedrockScript from '../scripts/Bedrock.js';
import JavaScript from '../scripts/Java.js';
import { INSTANCES_PATH } from '../utils/env.js';
import BadRequestError from '../errors/BadRequest.js';
import validate from '../validator/Instance.js';
import BedrockService from './Bedrock.js';
import JavaService from './Java.js';

class Instance {
  static async create(data) {
    validate(data);

    const { type } = data;
    let instance = null;
    if (type === 'bedrock') instance = await BedrockService.create(data);
    else if (type === 'java') instance = await JavaService.create(data);

    return instance;
  }

  static async readAll() {
    const instanceList = fs.readdirSync(INSTANCES_PATH);

    const instances = [];
    instanceList.map((id) => {
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

  static async update(id, data) {
    let instance = await Instance.readOne(id);
    validate(data, instance);

    const { type } = instance;
    if (type === 'bedrock') instance = await BedrockService.update(instance, data);
    else if (type === 'java') instance = await JavaService.update(instance, data);

    return instance;
  }

  static async delete(id) {
    const instance = await Instance.readOne(id);
    fs.rmSync(`${INSTANCES_PATH}/${id}`, { recursive: true });

    return instance;
  }

  static verifyInstanceInProgess(id) {
    return instancesList[id];
  }

  static async run(id) {
    const instance = await Instance.readOne(id);
    const { type } = instance;
    let newInstance = null;

    if (type === 'bedrock') newInstance = new BedrockScript(instance);
    else if (type === 'java') newInstance = new JavaScript(instance);
    else throw new Error();

    instancesList[id] = newInstance;

    return instance;
  }

  static async stop(id) {
    const instance = await Instance.readOne(id);
    if (!Instance.verifyInstanceInProgess(id)) throw new BadRequestError('Instance is not in progress');

    // Stop Instance
    instancesList[id].stop();
    instancesList[id] = null;

    return instance;
  }

  static async downloadWorld(id) {
    const instance = await Instance.readOne(id);

    const { type } = instance;
    let path = null;
    if (type === 'bedrock') path = await BedrockService.downloadWorld(instance);
    else if (type === 'java') path = await JavaService.downloadWorld(instance);

    return path;
  }

  static async uploadWorld(id, uploadPath) {
    const instance = await Instance.readOne(id);

    const { type } = instance;
    if (type === 'bedrock') await BedrockService.uploadWorld(instance, uploadPath);
    else if (type === 'java') await JavaService.uploadWorld(instance, uploadPath);

    return instance;
  }
}

export default Instance;
