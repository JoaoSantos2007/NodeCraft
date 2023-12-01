import InstanceService from '../services/Instance.js';
import errorHandler from '../utils/errorHandler.js';
import InvalidRequestError from '../errors/InvalidRequest.js';

class Instance {
  static verifyInProgress(req, res, next) {
    try {
      // eslint-disable-next-line prefer-destructuring
      const id = req.params.id;

      if (InstanceService.verifyInstanceInProgess(id)) throw new InvalidRequestError('You cannot do this action while instance is in progress!');

      return next();
    } catch (err) {
      return errorHandler(err, res);
    }
  }
}

export default Instance;
