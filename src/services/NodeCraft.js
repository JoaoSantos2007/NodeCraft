import { existsSync, readFileSync, writeFileSync } from 'fs';
import { INSTANCES_PATH } from '../utils/env.js';
import { getList } from '../utils/Properties.js';
import { BadRequest } from '../errors/index.js';

class NodeCraft {
  static create(info) {
    const settings = {
      ...info,
      build: null,
      maxHistoryLines: 100,
      disableUpdate: false,
      players: {},
      properties: getList(info.type),
      history: [],
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

  static save(settings) {
    const json = JSON.stringify(settings);
    writeFileSync(`${INSTANCES_PATH}/${settings.id}/nodecraft.json`, json, 'utf-8');
  }
}

export default NodeCraft;
