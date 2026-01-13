import { Router } from 'express';
import Controller from '../controllers/User.js';
import auth from '../middlewares/auth.js';

const router = Router();

router
  .get(
    '/user',
    (req, res, next) => auth('logged', req, res, next),
    Controller.read,
  )
  .get(
    '/user/all',
    (req, res, next) => auth('admin', req, res, next),
    Controller.readAll,
  )
  .get(
    '/user/:id',
    (req, res, next) => auth('logged', req, res, next),
    Controller.readById,
  )
  .post(
    '/user',
    Controller.create,
  )
  .put(
    '/user',
    (req, res, next) => auth('logged', req, res, next),
    Controller.update,
  )
  .put(
    '/user/:id',
    (req, res, next) => auth('admin', req, res, next),
    Controller.updateOther,
  )
  .delete(
    '/user',
    (req, res, next) => auth('logged', req, res, next),
    Controller.delete,
  )
  .delete(
    '/user/:id',
    (req, res, next) => auth('admin', req, res, next),
    Controller.deleteOther,
  )
  .post(
    '/user/login',
    Controller.login,
  )
  .post(
    '/user/verify',
    (req, res, next) => auth('logged', req, res, next),
    Controller.sendVerification,
  )
  .post(
    '/user/validate',
    Controller.validateAccount,
  )
  .post(
    '/user/forgot',
    Controller.forgotPassword,
  )
  .post(
    '/user/reset',
    Controller.resetPassword,
  );

export default router;
