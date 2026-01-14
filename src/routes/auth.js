import { Router } from 'express';
import Controller from '../controllers/Auth.js';
import auth from '../middlewares/auth.js';

const router = Router();

router
  .post(
    '/auth/login',
    Controller.login,
  )
  .post(
    '/auth/refresh',
    Controller.refresh,
  )
  .post(
    '/auth/verify',
    (req, res, next) => auth('logged', req, res, next),
    Controller.sendVerification,
  )
  .post(
    '/auth/validate',
    (req, res, next) => auth('logged', req, res, next),
    Controller.validateAccount,
  )
  .post(
    '/auth/forgot',
    Controller.forgotPassword,
  )
  .post(
    '/auth/reset',
    Controller.resetPassword,
  );

export default router;
