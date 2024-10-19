import { Router } from 'express';
import Action from '../controller/Action.js';
import InstanceMiddleware from '../middlewares/Instance.js';
import Auth from '../middlewares/Auth.js';

const router = Router();

router
  .get('/:id/action', Auth.verifyAccess, Action.status)
  .post('/:id/action', Auth.verifyAccess, InstanceMiddleware.verifyInProgress, Action.run)
  .put('/:id/action', Auth.verifyAccess, InstanceMiddleware.verifyInProgress, Action.update)
  .delete('/:id/action', Auth.verifyAccess, Action.stop);

export default router;
