import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import hashPassword from '../utils/hashPassword.js';
import { ACCESS_TOKEN_LIFETIME, SECRET } from '../utils/env.js';
import UnathorizedError from '../errors/Unathorized.js';

class Auth {
  static async login({ email, password }) {
    const user = await User.findOne({
      attributes: ['id', 'email', 'password'],
      where: {
        email,
      },
    });

    if (!user) throw new UnathorizedError('Email or Password is invalid!');

    const equalPasswords = hashPassword(password) === user.password;

    if (!equalPasswords) throw new UnathorizedError('Email or Password is invalid!');

    return user;
  }

  static async generateAccessToken({ id, email }) {
    const accessToken = jwt.sign({
      id,
      email,
    }, SECRET, {
      expiresIn: ACCESS_TOKEN_LIFETIME,
    });

    return accessToken;
  }
}

export default Auth;
