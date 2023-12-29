import { readdirSync, rmSync } from 'fs';
import { randomUUID } from 'crypto';
import instancesList from '../utils/instancesList.js';
import BedrockScript from '../scripts/Bedrock.js';
import JavaScript from '../scripts/Java.js';
import { INSTANCES_PATH } from '../utils/env.js';
import { BadRequest, InvalidRequest } from '../errors/index.js';
import validate from '../validator/Instance.js';
import BedrockService from './Bedrock.js';
import JavaService from './Java.js';
import NodeCraft from './NodeCraft.js';

class Instance {
  static async create(data, version) {
    validate(data);

    const { type } = data;
    const id = randomUUID();
    let instance = null;
    const software = data.software || 'vanilla';

    if (type === 'bedrock' && (software !== 'vanilla' || version)) throw new InvalidRequest("Bedrock doesn't support unnoficial softwares");
    if (type === 'bedrock') instance = await BedrockService.create(id);
    else if (type === 'java') instance = await JavaService.create(id, software, version);

    instance = await Instance.update(id, data);

    return instance;
  }

  static async readAll() {
    const instanceList = readdirSync(INSTANCES_PATH);

    const instances = [];
    instanceList.map((id) => instances.push(NodeCraft.read(id)));

    return instances;
  }

  static readOne(id) {
    return NodeCraft.read(id);
  }

  static async update(id, data) {
    const instance = await Instance.readOne(id);
    validate(data, instance);

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'object' && key === 'properties') {
        const { properties } = data;

        // eslint-disable-next-line no-restricted-syntax
        for (const [propertieKey, propertieValue] of Object.entries(properties)) {
          instance[key][propertieKey] = propertieValue;
        }
      } else {
        instance[key] = value;
      }
    }

    NodeCraft.save(instance);
    return instance;
  }

  static async delete(id) {
    const instance = await Instance.readOne(id);
    rmSync(`${INSTANCES_PATH}/${id}`, { recursive: true });

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
    if (!Instance.verifyInstanceInProgess(id)) throw new BadRequest('Instance is not in progress!');

    instancesList[id].stop();
    instancesList[id] = null;
    return instance;
  }

  static async updateVersion(id) {
    const instance = await Instance.readOne(id);

    if (instance.disableUpdate) throw new InvalidRequest('Updates are disabled for this instance!');

    const { type } = instance;
    let info = { version: instance.version, build: instance.build, updated: false };
    if (type === 'bedrock') info = await BedrockService.update(instance);
    else if (type === 'java') info = await JavaService.update(instance);

    return info;
  }

  // Revisar
  static async updateVersionAll() {
    const instances = await Instance.readAll();

    instances.forEach(async (instance) => {
      if (!instance.disableUpdate) {
        const { id } = instance;
        if (Instance.verifyInstanceInProgess(id)) await Instance.stop(id);
        await Instance.updateVersion(instance.id);
      }
    });
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
