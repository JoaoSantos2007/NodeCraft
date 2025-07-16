import Service from '../services/Role.js';
import GroupService from '../services/Group.js';
import Validator from '../validators/Role.js';

class Role {
  static async readAll(req, res, next) {
    try {
      const groupId = req?.params?.groupId;

      const group = await GroupService.readOne(groupId);
      const roles = await Service.readAll(group);

      return res.status(200).json({ success: true, roles });
    } catch (err) {
      return next(err);
    }
  }

  static async readOne(req, res, next) {
    try {
      const groupId = req?.params?.groupId;
      const roleId = req?.params?.roleId;

      const group = await GroupService.readOne(groupId);
      const role = await Service.readOne(group, roleId);

      return res.status(200).json({ success: true, role });
    } catch (err) {
      return next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const groupId = req?.params?.groupId;
      const data = req.body;

      Validator(data, false, true);
      const group = await GroupService.readOne(groupId);
      const role = await Service.create(group, data);

      return res.status(201).json({ success: true, created: true, role });
    } catch (err) {
      return next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const groupId = req?.params?.groupId;
      const roleId = req?.params?.roleId;
      const data = req.body;

      Validator(data, true);
      const group = await GroupService.readOne(groupId);
      const role = await Service.update(group, roleId, data);

      return res.status(200).json({ success: true, updated: true, role });
    } catch (err) {
      return next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const groupId = req?.params?.groupId;
      const roleId = req?.params?.roleId;

      const group = await GroupService.readOne(groupId);
      const role = await Service.delete(group, roleId);

      return res.status(200).json({ success: true, deleted: true, role });
    } catch (err) {
      return next(err);
    }
  }
}

export default Role;
