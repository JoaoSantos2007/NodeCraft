import RoleService from '../services/Role.js';

class Role {
  static async read(req, res, next) {
    try {
      const roles = await RoleService.getAll();

      return res.status(200).json({ success: true, roles });
    } catch (err) {
      return next(err);
    }
  }

  static async readById(req, res, next) {
    try {
      const { id } = req.params;
      const role = await RoleService.getById(id);

      return res.status(200).json({ success: true, role });
    } catch (err) {
      return next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const data = req.body;
      const role = await RoleService.create(data);

      return res.status(201).json({ success: true, created: true, role });
    } catch (err) {
      return next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;
      const role = await RoleService.update(id, data);

      return res.status(200).json({ success: true, updated: true, role });
    } catch (err) {
      return next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const role = await RoleService.delete(id);

      return res.status(200).json({ success: true, deleted: true, role });
    } catch (err) {
      return next(err);
    }
  }
}

export default Role;