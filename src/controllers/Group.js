import Service from '../services/Group.js';
import MemberService from '../services/Member.js';

class Group {
  static async readAll(req, res, next) {
    try {
      const { user } = req;
      let groups = [];

      if (user.admin === true) groups = await Service.readAll();
      else {
        const groupsId = await MemberService.readAllGroupsByUser(user.id);
        groups = await Service.readAllGroupsByIds(groupsId);
      }

      return res.status(200).json({ success: true, groups });
    } catch (err) {
      return next(err);
    }
  }

  static async readOne(req, res, next) {
    try {
      const id = req?.params?.id;
      const group = await Service.readOne(id);

      return res.status(200).json({ success: true, group });
    } catch (err) {
      return next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const data = req.body;
      const group = await Service.create(data);

      return res.status(201).json({ success: true, created: true, group });
    } catch (err) {
      return next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const id = req?.params?.id;
      const data = req.body;

      const group = await Service.update(id, data);

      return res.status(200).json({ success: true, updated: true, group });
    } catch (err) {
      return next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const id = req?.params?.id;
      const group = await Service.delete(id);

      return res.status(200).json({ success: true, deleted: true, group });
    } catch (err) {
      return next(err);
    }
  }
}

export default Group;
