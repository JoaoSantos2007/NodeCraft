import InstanceService from '../services/Instance.js';

class Instance {
  static async create(req, res, next) {
    try {
      // eslint-disable-next-line prefer-destructuring
      const version = req.params.version;
      const { body } = req;
      const instance = await InstanceService.create(body, version);

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

  static async updateVersion(req, res, next) {
    try {
      const { id } = req.params;
      const info = await InstanceService.updateVersion(id);
      const msg = info.updated ? 'Instance Updated!' : 'No Update Available!';

      return res.status(200).json({
        success: true,
        updated: !!info.updated,
        version: info.version,
        build: info.build,
        msg,
      });
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

  static async downloadWorld(req, res, next) {
    try {
      const { id } = req.params;
      const path = await InstanceService.downloadWorld(id);

      return res.download(path);
    } catch (err) {
      return next(err);
    }
  }

  static async uploadWorld(req, res, next) {
    try {
      const { id } = req.params;
      const { upload } = req;
      const instance = await InstanceService.uploadWorld(id, upload);

      return res.status(200).json({ success: true, uploaded: true, instance });
    } catch (err) {
      return next(err);
    }
  }
}

export default Instance;
