import InstanceService from '../services/Instance.js';

class Instance {
  static async create(req, res, next) {
    try {
      const data = req.body;
      await InstanceService.create(data);

      return res.status(201).json({ success: true });
    } catch (err) {
      return next(err);
    }
  }
}

export default Instance;
