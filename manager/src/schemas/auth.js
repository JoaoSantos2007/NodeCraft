import Joi from 'joi';

const emailedToken = Joi.string().trim().max(512).required();

const login = Joi.object({
  email: Joi.string().trim().max(254).email().required(),
  password: Joi.string().trim().max(72).required(),
});

const validateAccount = Joi.object({
  token: emailedToken,
});

const forgotPassword = Joi.object({
  email: Joi.string().trim().max(254).email().required(),
});

const resetPassword = Joi.object({
  token: emailedToken,
  password: Joi.string().trim().min(8).max(72).required(),
});

export {
  login, validateAccount, forgotPassword, resetPassword,
};
