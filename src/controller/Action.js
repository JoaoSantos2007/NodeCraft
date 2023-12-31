import ActionService from '../services/Action.js';

class Action {
  static async status(req, res, next) {
    try {
      const { id } = req.params;
      const status = await ActionService.readStatus(id);

      return res.status(200).json({ success: true, status });
    } catch (err) {
      return next(err);
    }
  }

  static async run(req, res, next) {
    try {
      const { id } = req.params;
      const instance = await ActionService.runInstance(id);

      return res.status(200).json({ success: true, running: true, instance });
    } catch (err) {
      return next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const info = await ActionService.updateInstance(id);
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

  static async stop(req, res, next) {
    try {
      const { id } = req.params;
      const instance = await ActionService.stopInstance(id);

      return res.status(200).json({ success: true, stopped: true, instance });
    } catch (err) {
      return next(err);
    }
  }
}

export default Action;
