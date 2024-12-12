import errorHandler from '../utils/errorHandler.js';

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (error, req, res, next) => {
  errorHandler(error, res);
};

export default errorMiddleware;
