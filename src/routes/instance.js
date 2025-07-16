import { Router } from 'express';
import Controller from '../controllers/Instance.js';
import Middleware from '../middlewares/Instance.js';
import player from './player.js';
import file from './file.js';
import Auth from '../middlewares/Auth.js';

const router = Router();

router
  .get(
    '/instance',
    (req, res, next) => Auth.verifyAccess('logged', req, res, next),
    Controller.readAll,
  )
  .get(
    '/instance/:id',
    (req, res, next) => Auth.verifyAccess('instance:read', req, res, next),
    Controller.readOne,
  )
  .post(
    '/instance',
    (req, res, next) => Auth.verifyAccess('logged', req, res, next),
    Controller.create,
  )
  .put(
    '/instance/:id',
    (req, res, next) => Auth.verifyAccess('instance:update', req, res, next),
    Middleware.verifyInProgress,
    Controller.update,
  )
  .delete(
    '/instance/:id',
    (req, res, next) => Auth.verifyAccess('instance:delete', req, res, next),
    Middleware.verifyInProgress,
    Controller.delete,
  )
  .post(
    '/instance/:id/run',
    (req, res, next) => Auth.verifyAccess('instance:execute', req, res, next),
    Middleware.verifyInProgress,
    Controller.run,
  )
  .post(
    '/instance/:id/stop',
    (req, res, next) => Auth.verifyAccess('instance:execute', req, res, next),
    Controller.stop,
  )
  .post(
    '/instance/:id/update',
    (req, res, next) => Auth.verifyAccess('instance:update', req, res, next),
    Controller.updateVersion,
  )
  .put(
    '/instance/:id/redefine/properties',
    (req, res, next) => Auth.verifyAccess('instance:update', req, res, next),
    Controller.redefineProperties,
  )
  .put(
    '/instance/all/remap/port',
    (req, res, next) => Auth.verifyAccess('admin', req, res, next),
    Controller.remapAllPorts,
  )
  .put(
    '/instance/:id/remap/port',
    (req, res, next) => Auth.verifyAccess('instance:update', req, res, next),
    Controller.remapPort,
  )
  .use('/instance', player)
  .use('/instance', file);

export default router;
