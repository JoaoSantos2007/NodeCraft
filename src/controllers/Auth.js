import Service from '../services/Auth.js';
import { STAGE } from '../../config/settings.js';

class Auth {
  static async login(req, res, next) {
    try {
      const data = req.body;

      const user = await Service.login(data);
      const accessToken = await Service.generateAccessToken(user);
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: STAGE !== 'DEV',
        sameSite: STAGE === 'DEV' ? 'Lax' : 'strict',
      });

      return res.status(200).json({ success: true, logged: true });
    } catch (err) {
      return next(err);
    }
  }
}

export default Auth;
