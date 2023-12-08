import { writeFileSync } from 'fs';
import { INSTANCES_PATH } from '../utils/env.js';
import Propreties from './Properties.js';

class NodeCraft {
  static get(id, version, type) {
    const instancePath = `${INSTANCES_PATH}/${id}`;
    const properties = Propreties.getPropertiesListLocal(instancePath);
    properties['level-name'] = 'world';

    const settings = {
      id,
      name: 'A Minecraft Server',
      type,
      version,
      disableUpdate: false,
      properties,
    };

    return settings;
  }

  static create(id, version, type) {
    const data = NodeCraft.get(id, version, type);
    NodeCraft.save(id, data);

    return data;
  }

  static save(id, data) {
    const json = JSON.stringify(data);
    writeFileSync(`${INSTANCES_PATH}/${id}/nodecraft.json`, json, 'utf-8');
  }
}

export default NodeCraft;
