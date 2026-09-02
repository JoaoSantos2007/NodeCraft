import Service from '../services/Roster.js';

class Roster {
  static async readAll(req, res, next) {
    try {
      const { id } = req.params;
      const rosters = await Service.readAllByInstance(id);

      return res.status(200).json({ success: true, rosters });
    } catch (err) {
      return next(err);
    }
  }

  static async readOne(req, res, next) {
    try {
      const { id } = req.params;
      const { rosterId } = req.params;

      const roster = await Service.readOne(id, rosterId);

      return res.status(200).json({ success: true, roster });
    } catch (err) {
      return next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const { id } = req.params;
      const { body } = req;

      const roster = await Service.create(id, body);

      return res.status(201).json({ success: true, roster });
    } catch (err) {
      return next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { rosterId } = req.params;
      const { body } = req;

      const roster = await Service.update(id, rosterId, body);

      return res.status(200).json({ success: true, roster });
    } catch (err) {
      return next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const { rosterId } = req.params;
      const roster = await Service.delete(id, rosterId);

      return res.status(200).json({ success: true, roster });
    } catch (err) {
      return next(err);
    }
  }
}

export default Roster;
