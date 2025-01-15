import { Router } from 'express';
import Auth from '../middlewares/Auth.js';
import Controller from '../controllers/Settings.js';

const router = Router();

router
  .get(
    '/settings',
    (req, res, next) => Auth.verifyAccess('admin', req, res, next),
    Controller.read,
  )
  .put(
    '/settings',
    (req, res, next) => Auth.verifyAccess('admin', req, res, next),
    Controller.update,
  );

export default router;
