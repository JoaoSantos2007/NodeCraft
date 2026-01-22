import config from '../../config/index.js';
import { InvalidRequest } from '../errors/index.js';
import error from './error.js';

const verifyService = (service, req, res, next) => {
  try {
    if (service === 'email' && !config.email.enable) throw new InvalidRequest('Email service is not set!');

    return next();
  } catch (err) {
    return error(err, req, res);
  }
};

export default verifyService;
