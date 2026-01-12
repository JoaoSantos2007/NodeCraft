import jwt from 'jsonwebtoken';
import {
  ACCESS_TOKEN_LIFETIME,
  EMAIL_TOKEN_LIFETIME,
  SECRET,
} from '../../config/settings.js';
import { InvalidToken } from '../errors/index.js';

const generateAccessToken = (userId) => {
  const accessToken = jwt.sign(
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

  return accessToken;
};

const generateEmailToken = (userId) => {
  const emailToken = jwt.sign(
    {
      sub: userId,
      purpose: 'email_verification',
    },
    SECRET,
    {
      expiresIn: EMAIL_TOKEN_LIFETIME,
    },
  );

  return emailToken;
};

const verifyToken = (token) => {
  try {
    const payload = jwt.verify(token, SECRET);
    return payload;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new InvalidToken('The token is expired!');
    } else if (err.name === 'JsonWebTokenError') {
      throw new InvalidToken('The token is invalid!');
    } else if (err.name === 'NotBeforeError') {
      throw new InvalidToken('The token is not yet valid!');
    }

    throw new InvalidToken();
  }
};

export { verifyToken, generateAccessToken, generateEmailToken };
