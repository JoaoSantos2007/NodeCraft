import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Player from './Player.js';
import hashPassword from '../utils/hashPassword.js';
import { ACCESS_TOKEN_LIFETIME, SECRET } from '../../config/settings.js';
import { Unathorized } from '../errors/index.js';

class Auth {
  static async login({ email, password }) {
    const user = await User.findOne({
      attributes: ['id', 'email', 'password'],
      where: {
        email,
      },
    });

    if (!user) throw new Unathorized('Email or Password is invalid!');

    const equalPasswords = hashPassword(password) === user.password;

    if (!equalPasswords) throw new Unathorized('Email or Password is invalid!');

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

  static async verifyToken(req) {
    if (!req.cookies) throw new Unathorized('Invalid Access Token!');
    const { accessToken } = req.cookies;
    if (!accessToken) throw new Unathorized('Invalid Access Token!');

    return accessToken;
  }

  static async verifyUser(accessToken) {
    const { id } = jwt.verify(accessToken, SECRET);
    const user = await User.findByPk(id);

    return user;
  }

  static verifyUserAdmin(user) {
    return user.admin;
  }

  static async verifyUserAccess(instanceId, user) {
    if (Auth.verifyUserAdmin(user)) return true;

    const players = await Player.readAll(instanceId);
    // eslint-disable-next-line no-restricted-syntax
    for (const [, player] of Object.entries(players)) {
      if (player.accountId === user.id && player.admin) return true;
    }

    return false;
  }
}

export default Auth;
