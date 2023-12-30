import PlayerService from '../services/Player.js';

class Player {
  static async add(req, res, next) {
    try {
      const { instanceId } = req.params;
      const data = req.body;
      const player = await PlayerService.add(instanceId, data);

      return res.status(201).json({ success: true, created: true, player });
    } catch (err) {
      return next(err);
    }
  }

  static async readAll(req, res, next) {
    try {
      const { instanceId } = req.params;
      const players = await PlayerService.readAll(instanceId);

      return res.status(200).json({ success: true, players });
    } catch (err) {
      return next(err);
    }
  }

  static async readOne(req, res, next) {
    try {
      const { instanceId, playerId } = req.params;
      const player = await PlayerService.readOne(instanceId, playerId);

      return res.status(200).json({ success: true, player });
    } catch (err) {
      return next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { instanceId, playerId } = req.params;
      const data = req.body;
      const player = await PlayerService.update(instanceId, playerId, data);

      return res.status(200).json({ success: true, updated: true, player });
    } catch (err) {
      return next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { instanceId, playerId } = req.params;
      const player = await PlayerService.delete(instanceId, playerId);

      return res.status(200).json({ success: true, deleted: true, player });
    } catch (err) {
      return next(err);
    }
  }
}

export default Player;
