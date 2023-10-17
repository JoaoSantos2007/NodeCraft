import jwt from 'jsonwebtoken';
import { SECRET } from '../utils/env.js';
import errorHandler from '../utils/errorHandler.js';
import UnathorizedError from '../errors/Unathorized.js';

class Auth {
  static async verifyAuthorization(req, res, next) {
    try {
      if (!req.cookies) throw new UnathorizedError('Invalid Access Token!');
      const { accessToken } = req.cookies;
      if (!accessToken) throw new UnathorizedError('Invalid Access Token!');

      const { id } = jwt.verify(accessToken, SECRET);
      req.userId = id;

      return next();
    } catch (err) {
      return errorHandler(err, res);
    }
  }
}

export default Auth;
