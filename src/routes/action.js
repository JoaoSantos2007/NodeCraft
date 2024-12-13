import { Router } from 'express';
import Controller from '../controllers/Action.js';
import InstanceMiddleware from '../middlewares/Instance.js';
import Auth from '../middlewares/Auth.js';

const router = Router();

router
  .get('/:id/action', Auth.verifyAccess, Controller.status)
  .post('/:id/action', Auth.verifyAccess, InstanceMiddleware.verifyInProgress, Controller.run)
  .put('/:id/action', Auth.verifyAccess, InstanceMiddleware.verifyInProgress, Controller.update)
  .delete('/:id/action', Auth.verifyAccess, Controller.stop);

export default router;
