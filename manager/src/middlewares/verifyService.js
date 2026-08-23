import config from '../../config/config.js';
import { ServiceUnavailable } from '../errors/index.js';

const verifyService = (service) => (req, res, next) => {
  try {
    if (service === 'email' && !config.email.enable) throw new ServiceUnavailable('Email service is not set!');

    return next();
  } catch (err) {
    return next(err);
  }
};

export default verifyService;
