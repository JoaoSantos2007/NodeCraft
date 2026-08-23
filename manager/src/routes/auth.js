import { Router } from 'express';
import Controller from '../controllers/Auth.js';
import {
  auth, verifyService, loginLimiter, emailLimiter,
} from '../middlewares/index.js';

const router = Router();

router
  .post(
    '/auth/login',
    loginLimiter,
    Controller.login,
  )
  .post(
    '/auth/refresh',
    loginLimiter,
    Controller.refresh,
  )
  .post(
    '/auth/logout',
    auth('logged'),
    Controller.logout,
  )
  .post(
    '/auth/verify',
    verifyService('email'),
    emailLimiter,
    auth('logged'),
    Controller.sendVerification,
  )
  .post(
    '/auth/validate',
    verifyService('email'),
    auth('logged'),
    Controller.validateAccount,
  )
  .post(
    '/auth/forgot',
    verifyService('email'),
    emailLimiter,
    Controller.forgotPassword,
  )
  .post(
    '/auth/reset',
    verifyService('email'),
    loginLimiter,
    Controller.resetPassword,
  );

export default router;
