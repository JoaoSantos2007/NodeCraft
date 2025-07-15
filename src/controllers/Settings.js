import Service from '../services/Settings.js';
import Validator from '../validators/Settings.js';

class Settings {
  static read(req, res, next) {
    try {
      const settings = Service.read();

      return res.status(200).json({ success: true, settings });
    } catch (err) {
      return next(err);
    }
  }

  static update(req, res, next) {
    try {
      const data = req.body;
      Validator(data);
      const settings = Service.update(data);

      return res.status(200).json({ success: true, updated: true, settings });
    } catch (err) {
      return next(err);
    }
  }
}

export default Settings;
