import errorHandler from '../utils/errorHandler.js';
import {
  verifyToken, verifyUser, verifyUserAdmin, verifyUserAccess,
} from '../utils/auth.js';
import Unathorized from '../errors/Unathorized.js';

class Auth {
  static async verifyLogged(req, res, next) {
    try {
      const accessToken = await verifyToken(req);
      const user = await verifyUser(accessToken);
      req.user = user;

      return next();
    } catch (err) {
      return errorHandler(err, res);
    }
  }

  static async verifyAdmin(req, res, next) {
    try {
      const accessToken = await verifyToken(req);
      const user = await verifyUser(accessToken);
      if (!verifyUserAdmin(user)) throw new Unathorized('You need admin role!');
      req.user = user;

      return next();
    } catch (err) {
      return errorHandler(err, res);
    }
  }

  static async verifyAccess(req, res, next) {
    try {
      const id = req.params?.id;
      const accessToken = await verifyToken(req);
      const user = await verifyUser(accessToken);
      if (!await verifyUserAccess(id, user)) throw new Unathorized("You don't have access to this route!");
      req.user = user;

      return next();
    } catch (err) {
      return errorHandler(err, res);
    }
  }
}

export default Auth;
