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
    const settings = NodeCraft.get(id, version, type);
    NodeCraft.save(settings);

    return settings;
  }

  static save(settings) {
    const json = JSON.stringify(settings);
    writeFileSync(`${INSTANCES_PATH}/${settings.id}/nodecraft.json`, json, 'utf-8');
  }
}

export default NodeCraft;
