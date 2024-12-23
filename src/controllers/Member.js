import Service from '../services/Member.js';
import GroupService from '../services/Group.js';

class Member {
  static async readAll(req, res, next) {
    try {
      const groupId = req?.params?.groupId;

      const group = await GroupService.readOne(groupId);
      const members = await Service.readAll(group);

      return res.status(200).json({ success: true, members });
    } catch (err) {
      return next(err);
    }
  }

  static async readOne(req, res, next) {
    try {
      const groupId = req?.params?.groupId;
      const memberId = req?.params?.memberId;

      const group = await GroupService.readOne(groupId);
      const member = await Service.readOne(group, memberId);

      return res.status(200).json({ success: true, member });
    } catch (err) {
      return next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const groupId = req?.params?.groupId;
      const data = req.body;

      const group = await GroupService.readOne(groupId);
      const member = await Service.create(group, data);

      return res.status(201).json({ success: true, created: true, member });
    } catch (err) {
      return next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const groupId = req?.params?.groupId;
      const memberId = req?.params?.memberId;
      const data = req.body;

      const group = await GroupService.readOne(groupId);
      const member = await Service.update(group, memberId, data);

      return res.status(200).json({ success: true, updated: true, member });
    } catch (err) {
      return next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const groupId = req?.params?.groupId;
      const memberId = req?.params?.memberId;

      const group = await GroupService.readOne(groupId);
      const member = await Service.delete(group, memberId);

      return res.status(200).json({ success: true, deleted: true, member });
    } catch (err) {
      return next(err);
    }
  }
}

export default Member;
