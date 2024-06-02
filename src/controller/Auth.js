import Service from '../services/Auth.js';

class Auth {
  static async login(req, res, next) {
    try {
      const data = req.body;

      const user = await Service.login(data);
      const accessToken = await Service.generateAccessToken(user);
      res.cookie('accessToken', accessToken, { httpOnly: true });

      return res.status(200).json({ success: true, logged: true });
    } catch (err) {
      return next(err);
    }
  }
}

export default Auth;
