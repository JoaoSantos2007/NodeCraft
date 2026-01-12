import { Router } from 'express';
import auth from '../middlewares/auth.js';
import Controller from '../controllers/Link.js';

const router = Router();

router
  .get(
    '/:id/link',
    (req, res, next) => auth('instance:read', req, res, next),
    Controller.readAll,
  )
  .get(
    '/:id/link/:linkId',
    (req, res, next) => auth('instance:read', req, res, next),
    Controller.readOne,
  )
  .post(
    '/:id/link',
    (req, res, next) => auth('instance:owner', req, res, next),
    Controller.create,
  )
  .put(
    '/:id/link/:linkId',
    (req, res, next) => auth('instance:owner', req, res, next),
    Controller.update,
  )
  .delete(
    '/:id/link/:linkId',
    (req, res, next) => auth('instance:owner', req, res, next),
    Controller.delete,
  );

export default router;
