import FriendZoneService from '../services/FriendZone.js';

class FriendZone {
  static async read(req, res, next) {
    try {
      const { instanceId } = req.params;
      const friendZone = await FriendZoneService.read(instanceId);

      return res.status(200).json({ success: true, friendZone });
    } catch (err) {
      return next(err);
    }
  }

  static async readSpecific(req, res, next) {
    try {
      const { instanceId, userId } = req.params;
      const friendZone = await FriendZoneService.readSpecific(instanceId, userId);

      return res.status(200).json({ success: true, friendZone });
    } catch (err) {
      return next(err);
    }
  }

  static async add(req, res, next) {
    try {
      const { instanceId } = req.params;
      const friendZone = await FriendZoneService.add(instanceId, req.body);

      return res.status(201).json({ success: true, friendZone });
    } catch (err) {
      return next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { instanceId, userId } = req.params;
      const friendZone = await FriendZoneService.update(instanceId, userId, req.body);

      return res.status(200).json({ success: true, friendZone });
    } catch (err) {
      return next(err);
    }
  }

  static async remove(req, res, next) {
    try {
      const { instanceId, userId } = req.params;
      const friendZone = await FriendZoneService.remove(instanceId, userId);

      return res.status(200).json({ success: true, friendZone });
    } catch (err) {
      return next(err);
    }
  }
}

export default FriendZone;
