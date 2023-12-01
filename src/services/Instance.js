import fs from 'fs';
import instancesList from '../utils/instances.js';
import BedrockScript from '../scripts/Bedrock.js';
import { INSTANCES_PATH } from '../utils/env.js';
import BadRequestError from '../errors/BadRequest.js';

class Instance {
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

  static async delete(id) {
    const instance = await Instance.readOne(id);
    fs.rmdirSync(`${INSTANCES_PATH}/${id}`, { recursive: true, force: true });

    return instance;
  }

  static verifyInstanceInProgess(id) {
    const bedrockInstance = instancesList[id];

    return bedrockInstance;
  }

  static async run(id) {
    const instance = await Instance.readOne(id);

    // Run Instance
    const bedrockInstance = new BedrockScript(instance);
    instancesList[id] = bedrockInstance;

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
}

export default Instance;
