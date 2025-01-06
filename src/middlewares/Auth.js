import errorHandler from '../utils/errorHandler.js';
import Service from '../services/Auth.js';
import Unathorized from '../errors/Unathorized.js';

class Auth {
  static async verifyAccess(permission, req, res, next) {
    try {
      const id = req?.params?.id || req?.params.instanceId;

      // Get access token from request
      const accessToken = await Service.verifyToken(req);

      // Get user by access token
      const user = await Service.verifyUser(accessToken);
      req.user = user;

      // Check if has permission
      if (Service.checkPermission(user, permission, id)) return next();
      throw new Unathorized('You do not have permission to access this route!');
    } catch (err) {
      return errorHandler(err, res);
    }
  }
}

export default Auth;
