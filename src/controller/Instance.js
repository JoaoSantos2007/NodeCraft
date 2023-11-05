import InstanceService from '../services/Instance.js';

class Instance {
  static async create(req, res, next) {
    try {
      const { body } = req;
      const instance = await InstanceService.create(body);

      return res.status(201).json({ success: true, created: true, instance });
    } catch (err) {
      return next(err);
    }
  }

  static async readAll(req, res, next) {
    try {
      const instances = await InstanceService.readAll();

      return res.status(200).json({ success: true, instances });
    } catch (err) {
      return next(err);
    }
  }

  static async readOne(req, res, next) {
    try {
      const { id } = req.params;
      const instance = await InstanceService.readOne(id);

      return res.status(200).json({ success: true, instance });
    } catch (err) {
      return next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { body } = req;
      const instance = await InstanceService.update(id, body);

      return res.status(200).json({ success: true, updated: true, instance });
    } catch (err) {
      return next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const instance = await InstanceService.delete(id);

      return res.status(200).json({ success: true, deleted: true, instance });
    } catch (err) {
      return next(err);
    }
  }

  static async run(req, res, next) {
    try {
      const { id } = req.params;
      const instance = await InstanceService.run(id);

      return res.status(200).json({ success: true, running: true, instance });
    } catch (err) {
      return next(err);
    }
  }

  static async stop(req, res, next) {
    try {
      const { id } = req.params;
      const instance = await InstanceService.stop(id);

      return res.status(200).json({ success: true, stopped: true, instance });
    } catch (err) {
      return next(err);
    }
  }
}

export default Instance;
