import errorHandler from '../utils/errorHandler.js';
import Service from '../services/Auth.js';
import { Unathorized } from '../errors/index.js';

class Auth {
  static async verifyAccess(permission, req, res, next) {
    try {
      const id = req?.params?.id || req?.params?.instanceId;

      // Get access token from request
      const accessToken = req?.cookies?.accessToken;
      if (!accessToken) throw new Unathorized('Invalid Access Token!');

      // Get user by access token
      const user = await Service.verifyAccessToken(accessToken);
      req.user = user;

      // Check if user has permission
      if (await Service.checkPermission(user, permission, id)) return next();

      // If no return, throw Unathorized error
      throw new Unathorized("You don't have permission to access this route!");
    } catch (err) {
      return errorHandler(err, res);
    }
  }
}

export default Auth;
