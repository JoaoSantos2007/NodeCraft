import Bedrock from '../services/Bedrock.js';
import Service from '../services/Instance.js';
import Java from '../services/Java.js';

class Instance {
  static async create(req, res, next) {
    try {
      // eslint-disable-next-line prefer-destructuring
      const version = req.params.version;
      const { body } = req;

      // Este processo deverá já criar a variável da instância
      const { instance } = Service.create(body, version);

      if (instance.type === 'java') Java.create(instance);
      else Bedrock.create(instance);

      // let instance = null;
      // if (body.type === 'java') instance = await Java.create(id, body.software, version);
      // else instance = await Bedrock.create(id);
      // instance = await Service.update(id, body);

      return res.status(201).json({ success: true, building: true, instance });
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
