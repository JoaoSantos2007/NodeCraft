import Service from '../services/Instance.js';
import Bedrock from '../services/Bedrock.js';
import Java from '../services/Java.js';

class Instance {
  static create(req, res, next) {
    try {
      const { body } = req;

      const instance = Service.create(body);
      if (body.type === 'bedrock') Bedrock.install(instance);
      else Java.install(instance);

      return res.status(201).json({
        success: true, id: instance.id, building: true, instance,
      });
    } catch (err) {
      return next(err);
    }
  }

  static readAll(req, res, next) {
    try {
      const instances = Service.readAll();

      return res.status(200).json({ success: true, instances });
    } catch (err) {
      return next(err);
    }
  }

  static readOne(req, res, next) {
    try {
      const { id } = req.params;
      const instance = Service.readOne(id);

      return res.status(200).json({ success: true, instance });
    } catch (err) {
      return next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { body } = req;
      const instance = Service.update(id, body);

      return res.status(200).json({ success: true, updated: true, instance });
    } catch (err) {
      return next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const instance = Service.delete(id);

      return res.status(200).json({ success: true, deleted: true, instance });
    } catch (err) {
      return next(err);
    }
  }
}

export default Instance;
