import { Router } from 'express';
import Controller from '../controllers/Action.js';
import Middleware from '../middlewares/Instance.js';
import Auth from '../middlewares/Auth.js';

const router = Router();

router
  .get(
    '/:id/action/status',
    (req, res, next) => Auth.verifyAccess('instance:status', req, res, next),
    Controller.status,
  )
  .post(
    '/:id/action/run',
    (req, res, next) => Auth.verifyAccess('instance:execute', req, res, next),
    Middleware.verifyInProgress,
    Controller.run,
  )
  .put(
    '/:id/action/update',
    (req, res, next) => Auth.verifyAccess('instance:update', req, res, next),
    Middleware.verifyInProgress,
    Controller.update,
  )
  .delete(
    '/:id/action/stop',
    (req, res, next) => Auth.verifyAccess('instance:execute', req, res, next),
    Controller.stop,
  );

export default router;
