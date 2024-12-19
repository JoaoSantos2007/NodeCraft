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

    } catch (err) {
      return next(err);
    }
  }

  static async delete(req, res, next) {
    try {

    } catch (err) {
      return next(err);
    }
  }
}

export default Member;
