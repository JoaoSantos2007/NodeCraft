import { existsSync } from 'fs';
import { BadRequest, InvalidRequest } from '../errors/index.js';
import { INSTANCES_PATH } from '../utils/env.js';
import errorHandler from '../utils/errorHandler.js';

class File {
  static veryPath(req, res, next) {
    try {
      const { id, path = '' } = req.params;
      const absolutePath = `${INSTANCES_PATH}/${id}/${path}`;
      if (path.includes('..') || req.params[0].includes('..')) throw new InvalidRequest('.. is not valid in path');
      if (path.includes('nodecraft.json' || req.params[0].includes('nodecraft.json'))) throw new InvalidRequest('nodecraft.json cannot be edited!');
      if (!existsSync(absolutePath)) throw new BadRequest(`${path} not found!`);

      return next();
    } catch (err) {
      return errorHandler(err, res);
    }
  }
}

export default File;
