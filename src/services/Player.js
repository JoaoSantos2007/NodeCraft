import Model from '../models/Player.js';
import { BadRequest } from '../errors/index.js';

class Player {
  static async readAll(instanceId) {
    const players = await Model.findAll({
      where: {
        instanceId,
      },
      raw: true,
    });

    return players;
  }

  static async readOne(instanceId, playerId) {
    const player = await Model.findOne({
      where: {
        id: playerId,
        instanceId,
      },
    });

    if (!player) throw new BadRequest('Player not found!');

    return player;
  }

  static async create(instanceId, data) {
    const player = await Model.create({
      instanceId,
      ...data,
    });

    return player;
  }

  static async update(instanceId, playerId, data) {
    const player = await Player.readOne(instanceId, playerId);
    await player.update(data);

    return player;
  }

  static async delete(instanceId, playerId) {
    const player = await Player.readOne(instanceId, playerId);
    await player.destroy();

    return player;
  }
}

export default Player;
