import bcrypt from 'bcrypt';
import { User as Model, Link as LinkModel } from '../models/index.js';
import { hashPassword, hashToken } from '../utils/hash.js';
import {
  Duplicate,
  BadRequest,
  Unathorized,
  Email,
  InvalidToken,
} from '../errors/index.js';
import { generateEmailToken, verifyToken } from '../utils/tokens.js';
import sendEmail from '../utils/sendEmail.js';
import { API_URL } from '../../config/settings.js';
import { renderVerifyTemplate } from '../utils/templates.js';

class User {
  static async create(data) {
    let user = await Model.findOne({
      where: {
        email: data.email,
      },
    });

    // email already registered
    if (user) {
      throw new Duplicate('Email already registered!');
    }

    user = await Model.create({
      name: data.name,
      email: data.email,
      password: hashPassword(data.password),
      javaGamertag: data.javaGamertag,
      bedrockGamertag: data.bedrockGamertag,
      gender: data.gender,
      birthDate: data.birthDate,
    });

    return user;
  }

  static async readAll() {
    const user = await Model.findAll();

    return user;
  }

  static async readOne(id) {
    const user = await Model.findOne({
      where: {
        id,
      },
      include: {
        model: LinkModel,
        as: 'instances',
      },
    });

    if (!user) throw new BadRequest('User not found!');

    return user;
  }

  static async readWithPassword(email) {
    const user = await Model.findOne({
      attributes: ['id', 'email', 'password'],
      where: {
        email,
      },
    });

    return user;
  }

  static async readWithTokens(id) {
    const user = await Model.findByPk(id, {
      attributes: ['id', 'passwordToken', 'emailToken'],
    });

    return user;
  }

  static async update(id, data) {
    const user = await User.readOne(id);
    await user.update(data);

    return user;
  }

  static async delete(id) {
    const user = await User.readOne(id);
    await user.destroy();

    return user;
  }

  static async saveToken(id, token, type = 'email') {
    const hashedToken = hashToken(token);

    if (type === 'email') await User.update(id, { emailToken: hashedToken });
    else if (type === 'password') await User.update(id, { passwordToken: hashedToken });
  }

  static async wipeToken(id, type = 'email') {
    if (type === 'email') await User.update(id, { emailToken: null });
    else if (type === 'password') await User.update(id, { passwordToken: null });
  }

  static async authenticate(email, password) {
    const user = await User.readWithPassword(email);
    if (!user) throw new Unathorized('Email or Password is invalid!');

    const passwordsAreEqual = await bcrypt.compare(password, user.password);
    if (!passwordsAreEqual) throw new Unathorized('Email or Password is invalid!');

    return user;
  }

  static async sendVerification(user) {
    const token = generateEmailToken(user.id);

    // Save Email token on database
    await User.saveToken(user.id, token, 'email');

    // Send Email
    try {
      const link = `${API_URL}/user/validate?token=${token}`;
      const html = renderVerifyTemplate(link, user.name);

      await sendEmail({
        to: user.email,
        subject: 'Verify your Nodecraft Account!',
        html,
      });
    } catch (err) {
      // Catch email system error
      throw new Email();
    }
  }

  static async validateAccount(token) {
    const payload = verifyToken(token);

    const user = await User.readWithTokens(payload.sub);
    if (!user || !user?.emailToken) throw new InvalidToken('Email token is invalid!');

    const hashedToken = hashToken(token);
    if (!token || hashedToken !== user.emailToken) throw new InvalidToken('Email token is invalid!');

    // Set verified account and wipe tokens
    await User.update(user.id, { verified: true });
    await User.wipeToken(user.id, 'email');
  }
}

export default User;
