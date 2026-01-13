import Service from '../services/User.js';
import Validator from '../validators/User.js';
import { STAGE } from '../../config/settings.js';
import { InvalidRequest, InvalidToken } from '../errors/index.js';
import { generateAccessToken } from '../utils/tokens.js';

class User {
  static async read(req, res, next) {
    try {
      const { user } = req;
      return res.status(200).json({ success: true, user });
    } catch (err) {
      return next(err);
    }
  }

  static async readAll(req, res, next) {
    try {
      const users = await Service.readAll();

      return res.status(200).json({ success: true, users });
    } catch (err) {
      return next(err);
    }
  }

  static async readById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await Service.readOne(id);

      return res.status(200).json({ success: true, user });
    } catch (err) {
      return next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const data = req.body;

      Validator(data, false, true);
      const user = await Service.create(data);

      return res.status(201).json({ success: true, created: true, user });
    } catch (err) {
      return next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const data = req.body;
      const { user } = req;

      Validator(data, true);
      const userUpdated = await Service.update(user.id, data);

      return res.status(200).json({ success: true, updated: true, user: userUpdated });
    } catch (err) {
      return next(err);
    }
  }

  static async updateOther(req, res, next) {
    try {
      const data = req.body;
      const { id } = req.params;

      Validator(data, true);
      const user = await Service.update(id, data);

      return res.status(200).json({ success: true, updated: true, user });
    } catch (err) {
      return next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { user } = req;
      await Service.delete(user.id);

      return res.status(200).json({ success: true, deleted: true, user });
    } catch (err) {
      return next(err);
    }
  }

  static async deleteOther(req, res, next) {
    try {
      const { id } = req.params;
      const user = await Service.delete(id);

      return res.status(200).json({ success: true, deleted: true, user });
    } catch (err) {
      return next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const data = req.body;

      const user = await Service.authenticate(data.email, data.password);
      const accessToken = generateAccessToken(user.id);

      // Set accessToken in response cookie
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: STAGE !== 'DEV',
        sameSite: STAGE === 'DEV' ? 'Lax' : 'strict',
      });

      return res.status(200).json({ success: true, authenticated: true });
    } catch (err) {
      return next(err);
    }
  }

  static async sendVerification(req, res, next) {
    try {
      const { user } = req;
      if (user.verified) throw new InvalidRequest('User is already verified!');

      await Service.sendVerification(user);

      return res.status(200).json({ success: true, msg: `Account verification sent to ${user.email}` });
    } catch (err) {
      return next(err);
    }
  }

  static async validateAccount(req, res, next) {
    try {
      const token = req?.body?.token;
      if (typeof token !== 'string') throw new InvalidToken();

      await Service.validateAccount(token.trim());

      return res.status(200).json({ success: true, msg: 'Account Verified!' });
    } catch (err) {
      return next(err);
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      const email = req?.body?.email;

      await Service.forgotPassword(email);

      return res.status(200).json({ success: true, msg: `Reset password sent to ${email}` });
    } catch (err) {
      return next(err);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const token = req?.body?.token;
      const password = req?.body?.password;

      if (typeof token !== 'string') throw new InvalidToken();
      if (!password) throw new InvalidRequest('Password cannot be null!');

      await Service.resetPassword(token.trim(), password);

      return res.status(200).json({ success: true, msg: 'Password reseted!' });
    } catch (err) {
      return next(err);
    }
  }
}

export default User;
