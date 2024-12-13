import Service from '../services/Role.js';

class Role {
  static async readAll(req, res, next) {
    try {
      const roles = await Service.readAll();

      return res.status(200).json({ success: true, roles });
    } catch (err) {
      return next(err);
    }
  }

  static async readOne(req, res, next) {
    try {
      const id = req?.params?.id;
      const role = await Service.readOne(id);

      return res.status(200).json({ success: true, role });
    } catch (err) {
      return next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const data = req.body;
      const role = await Service.create(data);

      return res.status(201).json({ success: true, created: true, role });
    } catch (err) {
      return next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const id = req?.params?.id;
      const data = req.body;

      const role = await Service.update(id, data);

      return res.status(200).json({ success: true, updated: true, role });
    } catch (err) {
      return next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const id = req?.params?.id;
      const role = await Service.delete(id);

      return res.status(200).json({ success: true, deleted: true, role });
    } catch (err) {
      return next(err);
    }
  }
}

export default Role;
