import jwt from 'jsonwebtoken';
import { SECRET } from './env.js';
import UnathorizedError from '../errors/Unathorized.js';
import User from '../models/User.js';
import Player from '../services/Player.js';

async function verifyToken(req) {
  if (!req.cookies) throw new UnathorizedError('Invalid Access Token!');
  const { accessToken } = req.cookies;
  if (!accessToken) throw new UnathorizedError('Invalid Access Token!');

  return accessToken;
}

async function verifyUser(accessToken) {
  const { id } = jwt.verify(accessToken, SECRET);
  const user = await User.findByPk(id);

  return user;
}

function verifyUserAdmin(user) {
  return user.role === 'admin';
}

async function verifyUserAccess(instanceId, user) {
  if (verifyUserAdmin(user)) return true;

  const players = await Player.readAll(instanceId);
  // eslint-disable-next-line no-restricted-syntax
  for (const [, player] of Object.entries(players)) {
    if (player.accountId === user.id && player.admin) return true;
  }

  return false;
}

export {
  verifyToken, verifyUser, verifyUserAdmin, verifyUserAccess,
};
