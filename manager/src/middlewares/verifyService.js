import config from '../../config/config.js';
import { ServiceUnavailable } from '../errors/index.js';

const verifyService = (service) => (req, res, next) => {
  if (service === 'email' && !config.email.enable) {
    return next(new ServiceUnavailable('Email service is not set!'));
  }

  return next();
};

export default verifyService;
