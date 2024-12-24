import { existsSync, realpathSync } from 'fs';
import * as Path from 'path';
import { BadRequest, InvalidRequest } from '../errors/index.js';
import { INSTANCES_PATH } from '../utils/env.js';
import errorHandler from '../utils/errorHandler.js';
import isUUID from '../utils/isUUID.js';

class File {
  static verifyTwoPoints(path) {
    const regex = /\.\./;
    if (regex.test(path)) return true;

    return false;
  }

  static validateAllowedPath(id, path) {
    const instancePath = realpathSync(`${INSTANCES_PATH}/${id}`);

    if (path.includes('nodecraft.json')) return false;
    if (path.startsWith(instancePath)) return true;
    return false;
  }

  static verify(req, res, next, newPath = false) {
    try {
      const { id } = req.params;
      let path = req?.params?.path ?? '';
      path += req.params[0] || '';

      if (!isUUID(id)) throw new InvalidRequest(`${id} is not a valid uuid!`);
      if (File.verifyTwoPoints(path)) throw new InvalidRequest('directory traversal is not valid!');

      let realPath;

      if (newPath) {
        if (existsSync(`${INSTANCES_PATH}/${id}/${path}`)) throw new InvalidRequest(`${path} already exists!`);

        realPath = realpathSync(`${INSTANCES_PATH}/${id}/${Path.dirname(path)}`);
      } else {
        realPath = realpathSync(`${INSTANCES_PATH}/${id}/${path}`);
      }

      if (!File.validateAllowedPath(id, realPath)) throw new InvalidRequest(`${path} is forbidden!`);

      return next();
    } catch (err) {
      if (err.code === 'ENOENT') return errorHandler(new BadRequest('path not exists!'), res);
      return errorHandler(err, res);
    }
  }

  static verifyPath(req, res, next) {
    return File.verify(req, res, next, false);
  }

  static verifyNewPath(req, res, next) {
    return File.verify(req, res, next, true);
  }

  static verifyDestiny(req, res, next) {
    // Change the path params to destiny only for the verify method
    const reqCopy = { params: structuredClone(req.params) };
    reqCopy.params.path = req.params.destiny;
    [reqCopy.params[0]] = [req.params[1]];

    return File.verify(reqCopy, res, next, true);
  }
}

export default File;
