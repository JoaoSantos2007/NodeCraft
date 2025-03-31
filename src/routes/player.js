import { Router } from 'express';
import Controller from '../controllers/Player.js';
import Auth from '../middlewares/Auth.js';

const router = Router();

router
  .get(
    '/:instanceId/player',
    (req, res, next) => Auth.verifyAccess('instance:player:read', req, res, next),
    Controller.readAll,
  )
  .get(
    '/:instanceId/player/:playerId',
    (req, res, next) => Auth.verifyAccess('instance:player:read', req, res, next),
    Controller.readOne,
  )
  .post(
    '/:instanceId/player',
    (req, res, next) => Auth.verifyAccess('instance:player:create', req, res, next),
    Controller.create,
  )
  .put(
    '/:instanceId/player/:playerId',
    (req, res, next) => Auth.verifyAccess('instance:player:update', req, res, next),
    Controller.update,
  )
  .delete(
    '/:instanceId/player/:playerId',
    (req, res, next) => Auth.verifyAccess('instance:player:delete', req, res, next),
    Controller.delete,
  );

export default router;
