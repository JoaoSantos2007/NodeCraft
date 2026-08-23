import { NotFound } from '../errors/index.js';

const handleNotFound = (req, res, next) => next(
  new NotFound(`Route ${req.method} ${req.path} not found`),
);

export default handleNotFound;
