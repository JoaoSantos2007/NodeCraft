import PermissionService from '../services/Permission.js';

class Permission {
  static async readAll(req, res, next) {
    try {
      const permissions = await PermissionService.getAll();

      return res.status(200).json({ success: true, permissions });
    } catch (err) {
      return next(err);
    }
  }

  static async readById(req, res, next) {
    try {
      const { id } = req.params;
      const permission = await PermissionService.getById(id);

      return res.status(200).json({ success: true, permission });
    } catch (err) {
      return next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const data = req.body;
      const permission = await PermissionService.create(data);

      return res.status(201).json({ success: true, created: true, permission });
    } catch (err) {
      return next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const data = req.body;
      const { id } = req.params;
      const permission = await PermissionService.update(id, data);

      return res.status(200).json({ success: true, updated: true, permission });
    } catch (err) {
      return next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const permission = await PermissionService.delete(id);

      return res.status(200).json({ success: true, deleted: true, permission });
    } catch (err) {
      return next(err);
    }
  }
}

export default Permission;
