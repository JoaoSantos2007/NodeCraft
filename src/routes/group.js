import { Router } from 'express';
import Contoller from '../controllers/Group.js';
import role from './role.js';
import member from './member.js';
import Auth from '../middlewares/Auth.js';

const router = Router();

router
  .get(
    '/group',
    (req, res, next) => Auth.verifyAccess('logged', req, res, next),
    Contoller.readAll,
  )
  .get(
    '/group/:id',
    (req, res, next) => Auth.verifyAccess('group:read', req, res, next),
    Contoller.readOne,
  )
  .post(
    '/group',
    (req, res, next) => Auth.verifyAccess('admin', req, res, next),
    Contoller.create,
  )
  .put(
    '/group/:id',
    (req, res, next) => Auth.verifyAccess('group:update', req, res, next),
    Contoller.update,
  )
  .delete(
    '/group/:id',
    (req, res, next) => Auth.verifyAccess('group:delete', req, res, next),
    Contoller.delete,
  )
  .use('/group', role)
  .use('/group', member);

export default router;
