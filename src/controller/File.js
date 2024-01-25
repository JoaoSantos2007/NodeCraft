import Service from '../services/File.js';

class File {
  static read(req, res, next) {
    try {
      const { id } = req.params;
      let path = req?.params?.path ?? '';
      path += req.params[0] || '';

      const files = Service.read(id, path || '/');
      return res.status(200).json({ success: true, files });
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

      Service.create(id, path, body);
      return res.status(201).json({ success: true, created: true });
    } catch (err) {
      return next(err);
    }
  }

  static update(req, res, next) {
    try {
      return res.status(200).json({ success: true });
    } catch (err) {
      return next(err);
    }
  }

  static delete(req, res, next) {
    try {
      return res.status(200).json({ success: true });
    } catch (err) {
      return next(err);
    }
  }
}

export default File;
