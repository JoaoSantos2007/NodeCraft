import Joi from 'joi';

const createWorker = Joi.object({
  id: Joi.forbidden(),
  apiKey: Joi.forbidden(),
  secret: Joi.forbidden(),
  healthy: Joi.forbidden(),
  name: Joi.string().trim().min(3).max(32).required(),
});

const updateWorker = Joi.object({
  id: Joi.forbidden(),
  apiKey: Joi.forbidden(),
  healthy: Joi.forbidden(),
  name: Joi.string().trim().min(3).max(32),
  url: Joi.string().trim().uri({ scheme: ['http', 'https'] }).allow(''),
  secret: Joi.string().trim().allow('').max(512),
}).min(1);

export { createWorker, updateWorker };
