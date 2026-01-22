import { InvalidRequest } from '../errors/index.js';
import instancesRunning from '../runtime/instancesRunning.js';
import error from './error.js';

class Instance {
  static async verifyRunning(req, res, next) {
    try {
      const id = req?.params?.id;

      const runtime = instancesRunning[id];
      if (runtime) throw new InvalidRequest('You cannot do this while instance is running!');

      return next();
    } catch (err) {
      return error(err, req, res);
    }
  }

  static async verifyNotRunning(req, res, next) {
    try {
      const id = req?.params?.id;

      const runtime = instancesRunning[id];
      if (!runtime) throw new InvalidRequest('You cannot do this while instance is not running!');

      return next();
    } catch (err) {
      return error(err, req, res);
    }
  }
}

export default Instance;
