import Service from '../services/File.js';

class File {
  static read(req, res, next) {
    try {
      const { id } = req.params;
      let path = req?.params?.path ?? '';
      path += req.params[0] || '';

      const result = Service.read(id, path);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      return next(err);
    }
  }

  static create(req, res, next) {
    try {
      const { id } = req.params;
      const { body } = req;
      let path = req?.params?.path ?? '';
      path += req.params[0] || '';

      const result = Service.create(id, path, body);
      return res.status(201).json({ success: true, created: true, ...result });
    } catch (err) {
      return next(err);
    }
  }

  static update(req, res, next) {
    try {
      const { id } = req.params;
      const { body } = req;
      let path = req?.params?.path ?? '';
      path += req.params[0] || '';

      const result = Service.update(id, path, body);
      return res.status(200).json({ success: true, updated: true, ...result });
    } catch (err) {
      return next(err);
    }
  }

  static delete(req, res, next) {
    try {
      const { id } = req.params;
      let path = req?.params?.path ?? '';
      path += req.params[0] || '';

      const result = Service.delete(id, path);
      return res.status(200).json({ success: true, deleted: true, ...result });
    } catch (err) {
      return next(err);
    }
  }

  static download(req, res, next) {
    try {
      const { id } = req.params;
      let path = req?.params?.path ?? '';
      path += req.params[0] || '';

      const result = Service.download(id, path);
      return res.download(result);
    } catch (err) {
      return next(err);
    }
  }

  static upload(req, res, next) {
    try {
      const { location, filename } = req;

      return res.status(200).json({ success: true, location, filename });
    } catch (err) {
      return next(err);
    }
  }
}

export default File;
