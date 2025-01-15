import { Router } from 'express';
import Controller from '../controllers/Properties.js';
import Auth from '../middlewares/Auth.js';

const router = Router();

router
  .get(
    '/:id/properties',
    (req, res, next) => Auth.verifyAccess('instance:properties:read', req, res, next),
    Controller.read,
  )
  .put(
    '/:id/properties',
    (req, res, next) => Auth.verifyAccess('instance:properties:update', req, res, next),
    Controller.update,
  );

export default router;
