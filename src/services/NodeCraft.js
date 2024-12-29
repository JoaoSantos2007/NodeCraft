import { existsSync, readFileSync, writeFileSync } from 'fs';
import { INSTANCES_PATH } from '../../config/settings.js';
import List from './List.js';
import { BadRequest } from '../errors/index.js';

class NodeCraft {
  static create(info) {
    const settings = {
      ...info,
      installed: false,
      build: null,
      maxHistoryLines: 100,
      disableUpdate: false,
      players: {},
      properties: List.get(info.type),
      history: [],
      startCMD: info.type === 'bedrock' ? './bedrock_server' : 'java -jar server.jar nogui',
      worldPath: 'world',
      worldNetherPath: 'world_nether',
      worldEndPath: 'world_the_end',
      pluginsPath: 'plugins',
    };

    NodeCraft.save(settings);
    return settings;
  }

  static read(id) {
    const filePath = `${INSTANCES_PATH}/${id}/nodecraft.json`;
    if (!existsSync(filePath)) throw new BadRequest('Instance not found!');

    const rawData = readFileSync(filePath, 'utf-8');
    const instance = JSON.parse(rawData);

    return instance;
  }

  static update(id, settings) {
    const instance = NodeCraft.read(id);
    Object.assign(instance, settings);

    NodeCraft.save(instance);
  }

  static save(settings) {
    const json = JSON.stringify(settings);
    writeFileSync(`${INSTANCES_PATH}/${settings.id}/nodecraft.json`, json, 'utf-8');
  }
}

export default NodeCraft;
