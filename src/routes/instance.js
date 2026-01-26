import { Router } from 'express';
import Controller from '../controllers/Instance.js';
import file from './file.js';
import link from './link.js';
import auth from '../middlewares/auth.js';
import Middleware from '../middlewares/Instance.js';

const router = Router();

router
  .get(
    '/instance',
    (req, res, next) => auth('logged', req, res, next),
    Controller.readAll,
  )
  .get(
    '/instance/:id',
    (req, res, next) => auth('instance:read', req, res, next),
    Controller.readOne,
  )
  .post(
    '/instance',
    (req, res, next) => auth('logged', req, res, next),
    Controller.create,
  )
  .put(
    '/instance/:id',
    (req, res, next) => auth('instance:update', req, res, next),
    Middleware.verifyRunning,
    Controller.update,
  )
  .delete(
    '/instance/:id',
    (req, res, next) => auth('instance:delete', req, res, next),
    Middleware.verifyRunning,
    Controller.delete,
  )
  .post(
    '/instance/:id/run',
    (req, res, next) => auth('instance:execute', req, res, next),
    Middleware.verifyRunning,
    Controller.run,
  )
  .post(
    '/instance/:id/stop',
    (req, res, next) => auth('instance:execute', req, res, next),
    Middleware.verifyNotRunning,
    Controller.stop,
  )
  .post(
    '/instance/:id/restart',
    (req, res, next) => auth('instance:execute', req, res, next),
    Controller.restart,
  )
  .post(
    '/instance/:id/backup',
    (req, res, next) => auth('instance:backup', req, res, next),
    Controller.backup,
  )
  .put(
    '/instance/:id/remap/port',
    (req, res, next) => auth('instance:update', req, res, next),
    Middleware.verifyRunning,
    Controller.remapPort,
  )
  .use('/instance', file)
  .use('/instance', link);

export default router;
