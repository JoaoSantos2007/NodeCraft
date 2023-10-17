import jwt from 'jsonwebtoken';
import { ValidationError } from 'sequelize';
import Base from '../errors/Base.js';
import Unathorized from '../errors/Unathorized.js';
import InvalidRequest from '../errors/InvalidRequest.js';

const errorHandler = (error, res) => {
  if (error instanceof Base) {
    return error.send(res);
  }

  if (error instanceof jwt.TokenExpiredError) {
    return new Unathorized('Access Token Expired!').send(res);
  }

  if (error instanceof ValidationError) {
    return new InvalidRequest().send(res);
  }

  // eslint-disable-next-line no-console
  console.error(error);
  return new Base().send(res);
};

export default errorHandler;
