import { Router } from 'express';
import Controller from '../controllers/Auth.js';
import auth from '../middlewares/auth.js';
import verifyService from '../middlewares/verifyService.js';

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
    '/auth/logout',
    (req, res, next) => auth('logged', req, res, next),
    Controller.logout,
  )
  .post(
    '/auth/verify',
    (req, res, next) => verifyService('email', req, res, next),
    (req, res, next) => auth('logged', req, res, next),
    Controller.sendVerification,
  )
  .post(
    '/auth/validate',
    (req, res, next) => verifyService('email', req, res, next),
    (req, res, next) => auth('logged', req, res, next),
    Controller.validateAccount,
  )
  .post(
    '/auth/forgot',
    (req, res, next) => verifyService('email', req, res, next),
    Controller.forgotPassword,
  )
  .post(
    '/auth/reset',
    (req, res, next) => verifyService('email', req, res, next),
    Controller.resetPassword,
  );

export default router;
