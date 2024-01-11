import { readdirSync, rmSync } from 'fs';
import { randomUUID } from 'crypto';
import { INSTANCES_PATH } from '../utils/env.js';
import { InvalidRequest } from '../errors/index.js';
import instanceValidator from '../validators/instance.js';
import Bedrock from './Bedrock.js';
import Java from './Java.js';
import NodeCraft from './NodeCraft.js';

class Instance {
  static async create(data, version) {
    instanceValidator(data);

    const { type } = data;
    const id = randomUUID();
    let instance = null;
    const software = data.software || 'vanilla';

    if (type === 'bedrock' && (software !== 'vanilla' || version)) throw new InvalidRequest("Bedrock doesn't support unnoficial softwares");
    if (type === 'bedrock') instance = await Bedrock.create(id);
    else if (type === 'java') instance = await Java.create(id, software, version);

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
    instanceValidator(data, instance);

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(data)) instance[key] = value;
    NodeCraft.save(instance);

    return instance;
  }

  static async delete(id) {
    const instance = await Instance.readOne(id);
    rmSync(`${INSTANCES_PATH}/${id}`, { recursive: true });

    return instance;
  }
}

export default Instance;
