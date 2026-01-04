import Service from '../services/Instance.js';
import Validator from '../validators/Instance.js';

class Instance {
  static async create(req, res, next) {
    try {
      const { body, user } = req;

      // Verify user plan(future)

      Validator(body, false, true);
      const instance = await Service.create(body, user.id);

      return res.status(201).json({
        success: true, id: instance.id, building: true, instance,
      });
    } catch (err) {
      return next(err);
    }
  }

  static async readAll(req, res, next) {
    try {
      const { user } = req;
      const instances = await Service.personalRead(user);

      return res.status(200).json({ success: true, instances });
    } catch (err) {
      return next(err);
    }
  }

  static async readOne(req, res, next) {
    try {
      const { id } = req.params;
      const instance = await Service.readOne(id);

      return res.status(200).json({ success: true, instance });
    } catch (err) {
      return next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { body } = req;

      Validator(body, true);
      const instance = await Service.update(id, body);

      return res.status(200).json({ success: true, updated: true, instance });
    } catch (err) {
      return next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const instance = await Service.delete(id);

      return res.status(200).json({ success: true, deleted: true, instance });
    } catch (err) {
      return next(err);
    }
  }

  static async run(req, res, next) {
    try {
      const { id } = req.params;
      const instance = await Service.run(id);

      return res.status(200).json({ success: true, running: true, instance });
    } catch (err) {
      return next(err);
    }
  }

  static async stop(req, res, next) {
    try {
      const { id } = req.params;
      const instance = await Service.stop(id);

      return res.status(200).json({ success: true, stopping: true, instance });
    } catch (err) {
      return next(err);
    }
  }

  static async updateVersion(req, res, next) {
    try {
      const { id } = req.params;
      const force = req?.query?.force === 'true';
      const instance = await Service.readOne(id);
      const { info, updating } = await Service.install(instance, force);

      return res.status(200).json({
        success: true,
        version: info.instanceVersion || null,
        msg: updating ? 'Updating!' : 'All in date!',
        info,
      });
    } catch (err) {
      return next(err);
    }
  }

  static async remapPort(req, res, next) {
    try {
      const { id } = req.params;
      const port = await Service.selectPort();
      const instance = await Service.update(id, { port });

      return res.status(200).json({
        success: true, remapped: true, port, instance,
      });
    } catch (err) {
      return next(err);
    }
  }
}

export default Instance;
