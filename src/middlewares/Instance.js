import errorHandler from '../utils/errorHandler.js';
import InvalidRequestError from '../errors/InvalidRequest.js';
import Service from '../services/Instance.js';

class Instance {
  static verifyInProgress(req, res, next) {
    try {
      // eslint-disable-next-line prefer-destructuring
      const id = req.params.id;
      if (Service.verifyInProgess(id)) throw new InvalidRequestError('You cannot do this action while instance is in progress!');

      return next();
    } catch (err) {
      return errorHandler(err, res);
    }
  }
}

export default Instance;
