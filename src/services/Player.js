import { randomUUID } from 'crypto';
import Validator from '../validators/Player.js';
import Instance from './Instance.js';
import NodeCraft from './NodeCraft.js';
import { BadRequest } from '../errors/index.js';

class Player {
  static async readAll(id) {
    const instance = await Instance.readOne(id);

    return instance.players;
  }

  static async readOne(instanceId, playerId) {
    const instance = await Instance.readOne(instanceId);
    const player = instance.players[playerId];

    if (!player) throw new BadRequest('Player not found!');

    return player;
  }

  static async add(id, data) {
    const instance = await Instance.readOne(id);
    Validator(data);

    const playerId = randomUUID();
    instance.players[playerId] = data;
    NodeCraft.save(instance);

    return instance.players;
  }

  static async update(instanceId, playerId, data) {
    const instance = await Instance.readOne(instanceId);
    const player = instance.players[playerId];
    if (!player) throw new BadRequest('Player not found!');
    Validator(data, player);

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(data)) player[key] = value;
    instance.players[playerId] = player;
    NodeCraft.save(instance);

    return player;
  }

  static async delete(instanceId, playerId) {
    const player = await Player.readOne(instanceId, playerId);

    const instance = await Instance.readOne(instanceId);
    delete instance.players[playerId];
    NodeCraft.save(instance);

    return player;
  }
}

export default Player;
