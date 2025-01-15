import { Router } from 'express';
import Controller from '../controllers/Member.js';
import Auth from '../middlewares/Auth.js';

const router = Router();

router
  .get(
    '/:groupId/member',
    (req, res, next) => Auth.verifyAccess('group:member:read', req, res, next),
    Controller.readAll,
  )
  .get(
    '/:groupId/member/:memberId',
    (req, res, next) => Auth.verifyAccess('group:member:read', req, res, next),
    Controller.readOne,
  )
  .post(
    '/:groupId/member',
    (req, res, next) => Auth.verifyAccess('group:member:create', req, res, next),
    Controller.create,
  )
  .put(
    '/:groupId/member/:memberId',
    (req, res, next) => Auth.verifyAccess('group:member:update', req, res, next),
    Controller.update,
  )
  .delete(
    '/:groupId/member/:memberId',
    (req, res, next) => Auth.verifyAccess('group:member:delete', req, res, next),
    Controller.delete,
  );

export default router;
