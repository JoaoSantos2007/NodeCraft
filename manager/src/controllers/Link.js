import Service from '../services/Link.js';

class Link {
  static async create(req, res, next) {
    try {
      const { id } = req.params;
      const { body } = req;

      const link = await Service.create(id, body);

      return res.status(201).json({ success: true, link });
    } catch (err) {
      return next(err);
    }
  }

  static async readAll(req, res, next) {
    try {
      const { id } = req.params;
      const links = await Service.readAllByInstance(id);

      return res.status(200).json({ success: true, links });
    } catch (err) {
      return next(err);
    }
  }

  static async readOne(req, res, next) {
    try {
      const { id } = req.params;
      const { linkId } = req.params;

      const link = await Service.readOne(id, linkId);

      return res.status(200).json({ success: true, link });
    } catch (err) {
      return next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { linkId } = req.params;
      const { body } = req;

      const link = await Service.update(id, linkId, body);

      return res.status(200).json({ success: true, link });
    } catch (err) {
      return next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const { linkId } = req.params;
      const link = await Service.delete(id, linkId);

      return res.status(200).json({ success: true, link });
    } catch (err) {
      return next(err);
    }
  }
}

export default Link;
