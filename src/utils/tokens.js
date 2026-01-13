import jwt from 'jsonwebtoken';
import {
  ACCESS_TOKEN_LIFETIME,
  EMAIL_TOKEN_LIFETIME,
  RESET_TOKEN_LIFETIME,
  SECRET,
} from '../../config/settings.js';
import { InvalidToken } from '../errors/index.js';

const generateAccessToken = (userId) => jwt.sign(
  {
    sub: userId,
    purpose: 'access',
  },
  SECRET,
  {
    expiresIn: ACCESS_TOKEN_LIFETIME,
    audience: 'api',
  },
);

const generateEmailToken = (userId) => jwt.sign(
  {
    sub: userId,
    purpose: 'email_verification',
  },
  SECRET,
  {
    expiresIn: EMAIL_TOKEN_LIFETIME,
  },
);

const generatePasswordToken = (userId, email) => jwt.sign(
  {
    sub: userId,
    email,
    purpose: 'password_reset',
  },
  SECRET,
  {
    expiresIn: RESET_TOKEN_LIFETIME,
  },
);

const verifyToken = (token) => {
  try {
    const payload = jwt.verify(token, SECRET);
    return payload;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new InvalidToken('Token is expired!');
    } else if (err.name === 'JsonWebTokenError') {
      throw new InvalidToken('Token is invalid!');
    } else if (err.name === 'NotBeforeError') {
      throw new InvalidToken('Token is not yet valid!');
    }

    throw new InvalidToken();
  }
};

export {
  verifyToken,
  generateAccessToken,
  generateEmailToken,
  generatePasswordToken,
};
