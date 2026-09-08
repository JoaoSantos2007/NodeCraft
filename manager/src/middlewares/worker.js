import Service from '../services/Worker.js';
import { Unathorized } from '../errors/index.js';
import auth from './auth.js';

const workerAuth = () => async (req, res, next) => {
  try {
    // Get id from request
    const id = req?.params?.id || req?.params?.workerId;

    // Get worker token from request
    const token = req.headers.authorization?.replace('Bearer ', '');

    // Verify if token exists
    if (!token) throw new Unathorized('Invalid Worker Token!');

    let worker = null;
    try {
      worker = await Service.readOneWithApiKey(id);
    } catch {
      throw new Unathorized('Invalid Worker Token!');
    }

    // Compare token with api key in the database
    const equalTokens = Service.compareApiKey(token, worker.apiKey);
    if (!equalTokens) throw new Unathorized('Invalid Worker Token!');

    req.worker = worker;
    return next();
  } catch (err) {
    return next(err);
  }
};

const workerOrAuth = (permission) => async (req, res, next) => {
  const id = req?.params?.id || req?.params?.workerId;
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (token && id) {
    try {
      const worker = await Service.readOneWithApiKey(id);

      if (Service.compareApiKey(token, worker.apiKey)) {
        req.worker = worker;

        return next();
      }
    } catch {
      // worker not found
    }
  }

  return auth(permission)(req, res, next);
};

export { workerOrAuth };
export default workerAuth;
