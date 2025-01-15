import Service from '../services/Properties.js';

class Properties {
  static async read(req, res, next) {
    try {
      const { id } = req.params;
      const properties = Service.read(id);

      return res.status(200).json({ success: true, properties });
    } catch (err) {
      return next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;
      const properties = Service.update(id, data);

      return res.status(200).json({ success: true, updated: true, properties });
    } catch (err) {
      return next(err);
    }
  }
}

export default Properties;
