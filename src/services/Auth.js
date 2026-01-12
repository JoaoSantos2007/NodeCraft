import jwt from 'jsonwebtoken';
import hash from '../utils/hash.js';
import Instance from './Instance.js';
import {
  ACCESS_TOKEN_LIFETIME,
  EMAIL_TOKEN_LIFETIME,
  SECRET,
} from '../../config/settings.js';
import { BadRequest, Token, Unathorized } from '../errors/index.js';
import Link from './Link.js';
import User from './User.js';

class Auth {
  static async authenticate(email, password) {
    const user = await User.readWithPassword(email);

    if (!user) throw new Unathorized('Email or Password is invalid!');
    if (hash(password) !== user.password) throw new Unathorized('Email or Password is invalid!');

    return user;
  }

  static async validateAccount(token) {
    const payload = Auth.verifyEmailToken(token);

    const user = await User.readWithTokens(payload.userId);
    if (!user || hash(token) !== hash(user?.emailToken)) throw new BadRequest('Email token is invalid!');

    // Set verified and wipe tokens
    await User.update(user.id, { verified: true });
    await User.wipeToken(user.id, 'email');
  }

  static generateAccessToken(user) {
    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        purpose: 'access',
      },
      SECRET,
      {
        expiresIn: ACCESS_TOKEN_LIFETIME,
        audience: 'api',
      },
    );

    return accessToken;
  }

  static generateEmailToken(user) {
    const emailToken = jwt.sign(
      {
        sub: user.id,
        purpose: 'email_verification',
      },
      SECRET,
      {
        expiresIn: EMAIL_TOKEN_LIFETIME,
      },
    );

    return emailToken;
  }

  static async verifyAccessToken(token) {
    try {
      const payload = jwt.verify(token, SECRET);
      const user = await User.readOne(payload.sub);
      return user;
    } catch (err) {
      throw new Token();
    }
  }

  static verifyEmailToken(token) {
    try {
      const payload = jwt.verify(token, SECRET);
      return payload;
    } catch (err) {
      throw new Token();
    }
  }

  static async checkPermission(user, permission, id) {
    if (permission === 'logged') return true;
    if (user.admin) return true;
    if (permission === 'admin') return false;

    // Verify player have permission on instance
    if (permission.split(':')[0] === 'instance') {
      const instance = await Instance.readOne(id);

      // Verify if user is owner of the instance
      if (instance.owner === user.id) return true;

      // Verify if user has any link with instance
      const permissions = await Link.readUserPermissions(user.id, id);
      if (!permissions) return false;
      if (permissions?.includes(permission)) return true;

      return false;
    }

    return false;
  }
}

export default Auth;
