import {
  Base,
  mapSequelizeError,
  mapHttpError,
} from '../errors/index.js';
import logger from '../../config/logger.js';

// eslint-disable-next-line no-unused-vars
const handleError = (err, req, res, next) => {
  if (res.headersSent) {
    logger.error({
      err,
      path: req.path,
      method: req.method,
    }, 'Error after response started');

    if (req.socket) req.socket.destroy();
    return undefined;
  }

  const sequelizeMappedError = mapSequelizeError(err);
  if (sequelizeMappedError) return sequelizeMappedError.send(res);

  const isAppError = err instanceof Base;
  if (!isAppError) {
    const httpMappedError = mapHttpError(err);
    if (httpMappedError) {
      logger.warn({
        status: httpMappedError.status,
        type: err?.type,
        path: req.path,
        method: req.method,
      }, 'Client error');

      return httpMappedError.send(res);
    }

    logger.error({
      err,
      path: req.path,
      method: req.method,
      bodyKeys: Object.keys(req.body || {}),
      params: req.params,
      query: req.query,
    }, 'Unhandled internal error');

    return new Base().send(res);
  }

  if (err.status === 500) {
    logger.error({
      err,
    }, 'Internal server error');
  }

  return err.send(res);
};

export default handleError;
