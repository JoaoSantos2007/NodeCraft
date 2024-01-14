import { Router } from 'express';
import Action from '../controller/Action.js';
import InstanceMiddleware from '../middlewares/Instance.js';

const router = Router();

router
  .get('/:id/action', Action.status)
  .post('/:id/action', InstanceMiddleware.verifyInProgress, Action.run)
  .put('/:id/action', InstanceMiddleware.verifyInProgress, Action.update)
  .delete('/:id/action', Action.stop);

export default router;
