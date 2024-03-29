import { existsSync, readFileSync, writeFileSync } from 'fs';
import { INSTANCES_PATH } from '../utils/env.js';
import { getPropertiesListLocal } from '../utils/Properties.js';
import { BadRequest } from '../errors/index.js';

class NodeCraft {
  static get(id, version, type, software = 'vanilla', build = null) {
    const instancePath = `${INSTANCES_PATH}/${id}`;
    const properties = getPropertiesListLocal(instancePath);
    properties['level-name'] = 'world';

    const settings = {
      id,
      name: 'A Minecraft Server',
      type,
      software,
      version,
      build,
      maxHistoryLines: 100,
      disableUpdate: false,
      players: {},
      properties,
      history: [],
    };

    return settings;
  }

  static read(id) {
    const filePath = `${INSTANCES_PATH}/${id}/nodecraft.json`;
    if (!existsSync(filePath)) throw new BadRequest('Instance not found!');

    const rawData = readFileSync(filePath, 'utf-8');
    const instance = JSON.parse(rawData);

    return instance;
  }

  static create(id, version, type, software, build = null) {
    const settings = NodeCraft.get(id, version, type, software, build);
    NodeCraft.save(settings);

    return settings;
  }

  static save(settings) {
    const json = JSON.stringify(settings);
    writeFileSync(`${INSTANCES_PATH}/${settings.id}/nodecraft.json`, json, 'utf-8');
  }
}

export default NodeCraft;
