import { Router } from 'express';
import Controller from '../controllers/User.js';
import Auth from '../middlewares/Auth.js';

const router = Router();

router
  .get(
    '/user',
    (req, res, next) => Auth.verifyAccess('', req, res, next),
    Controller.read,
  )
  .get(
    '/user/all',
    (req, res, next) => Auth.verifyAccess('', req, res, next),
    Controller.readMany,
  )
  .get(
    '/user/:id',
    (req, res, next) => Auth.verifyAccess('', req, res, next),
    Controller.readById,
  )
  .post(
    '/user',
    Controller.create,
  )
  .put(
    '/user',
    (req, res, next) => Auth.verifyAccess('', req, res, next),
    Controller.update,
  )
  .put(
    '/user/:id',
    (req, res, next) => Auth.verifyAccess('admin', req, res, next),
    Controller.updateOther,
  )
  .delete(
    '/user',
    (req, res, next) => Auth.verifyAccess('', req, res, next),
    Controller.delete,
  )
  .delete(
    '/user/:id',
    (req, res, next) => Auth.verifyAccess('admin', req, res, next),
    Controller.deleteOther,
  );

export default router;
