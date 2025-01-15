import { Router } from 'express';
import Controller from '../controllers/Role.js';
import Auth from '../middlewares/Auth.js';

const router = Router();

router
  .get(
    '/:groupId/role',
    (req, res, next) => Auth.verifyAccess('group:role:read', req, res, next),
    Controller.readAll,
  )
  .get(
    '/:groupId/role/:roleId',
    (req, res, next) => Auth.verifyAccess('group:role:read', req, res, next),
    Controller.readOne,
  )
  .post(
    '/:groupId/role',
    (req, res, next) => Auth.verifyAccess('group:role:create', req, res, next),
    Controller.create,
  )
  .put(
    '/:groupId/role/:roleId',
    (req, res, next) => Auth.verifyAccess('group:role:update', req, res, next),
    Controller.update,
  )
  .delete(
    '/:groupId/role/:roleId',
    (req, res, next) => Auth.verifyAccess('group:role:delete', req, res, next),
    Controller.delete,
  );

export default router;
