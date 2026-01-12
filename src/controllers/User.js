import Service from '../services/User.js';
import Auth from '../services/Auth.js';
import Validator from '../validators/User.js';
import { API_URL, STAGE } from '../../config/settings.js';
import { BadRequest, Email } from '../errors/index.js';
import sendEmail from '../utils/sendEmail.js';

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

      const user = await Auth.authenticate(data.email, data.password);
      const accessToken = Auth.generateAccessToken(user);
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

  static async verifyEmail(req, res, next) {
    try {
      const { user } = req;

      // Verify if user is already verified!
      if (user.verified) throw new BadRequest('User is already verified!');

      // Generate Email token
      const token = Auth.generateEmailToken(user);

      // Save Email token on database
      await User.saveToken(user.id, token, 'email');

      // Send email
      try {
        const link = `${API_URL}/user/validate?token=${token}`;
        await sendEmail({
          to: user.email,
          subject: 'Verify your Nodecraft Account!',
          html: `
        <h2>Bem-vindo!</h2>
        <p>Clique no link abaixo para verificar sua conta:</p>
        <a href="${link}">Verificar conta</a>
        <p>Este link expira em 24 horas.</p>
        `,
        });
      } catch (err) {
        throw new Email();
      }

      return res.status(200).json({ success: true, msg: `Account verification sent to ${user.email}` });
    } catch (err) {
      return next(err);
    }
  }

  static async validateAccount(req, res, next) {
    try {
      const token = req?.query?.token;

      await Auth.validateAccount(token);

      return res.status(200).json({ success: true, msg: 'Account Verified!' });
    } catch (err) {
      return next(err);
    }
  }
}

export default User;
