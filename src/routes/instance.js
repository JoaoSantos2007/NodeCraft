import { Router } from 'express';
import Controller from '../controllers/Instance.js';
import file from './file.js';
import link from './link.js';
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
    Controller.update,
  )
  .delete(
    '/instance/:id',
    (req, res, next) => Auth.verifyAccess('instance:delete', req, res, next),
    Controller.delete,
  )
  .post(
    '/instance/:id/run',
    (req, res, next) => Auth.verifyAccess('instance:execute', req, res, next),
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
    '/instance/:id/remap/port',
    (req, res, next) => Auth.verifyAccess('instance:update', req, res, next),
    Controller.remapPort,
  )
  .use('/instance', file)
  .use('/instance', link);

export default router;
