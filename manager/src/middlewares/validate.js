import { InvalidRequest } from '../errors/index.js';

const validate = (schema, property = 'body') => (req, res, next) => {
  const data = req[property];

  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });
  if (error) {
    return next(new InvalidRequest(error.details));
  }

  Object.defineProperty(req, property, {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  });

  return next();
};

export default validate;
