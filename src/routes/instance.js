import { Router } from 'express';
import Controller from '../controllers/Instance.js';
import Middleware from '../middlewares/Instance.js';
import player from './player.js';
import properties from './properties.js';
import action from './action.js';
import file from './file.js';
import Auth from '../middlewares/Auth.js';

const router = Router();

router
  .get(
    '/instance',
    (req, res, next) => Auth.verifyAccess('instance:read', req, res, next),
    Controller.readAll,
  )
  .get(
    '/instance/all',
    (req, res, next) => Auth.verifyAccess('admin', req, res, next),
    Controller.readAll,
  )
  .get(
    '/instance/:id',
    (req, res, next) => Auth.verifyAccess('instance:read', req, res, next),
    Controller.readOne,
  )
  .post(
    '/instance',
    (req, res, next) => Auth.verifyAccess('instance:write', req, res, next),
    Controller.create,
  )
  .put(
    '/instance/:id',
    (req, res, next) => Auth.verifyAccess('instance:write', req, res, next),
    Middleware.verifyInProgress,
    Controller.update,
  )
  .delete(
    '/instance/:id',
    (req, res, next) => Auth.verifyAccess('instance:write', req, res, next),
    Middleware.verifyInProgress,
    Controller.delete,
  )
  .use('/instance', action)
  .use('/instance', properties)
  .use('/instance', player)
  .use('/instance', file);

export default router;
