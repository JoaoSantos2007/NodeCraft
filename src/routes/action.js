import { Router } from 'express';
import Controller from '../controllers/Action.js';
import Middleware from '../middlewares/Instance.js';
import Auth from '../middlewares/Auth.js';

const router = Router();

router
  .get('/:id/action/status', Auth.verifyAccess, Controller.status)
  .post('/:id/action/run', Auth.verifyAccess, Middleware.verifyInProgress, Controller.run)
  .put('/:id/action/update', Auth.verifyAccess, Middleware.verifyInProgress, Controller.update)
  .delete('/:id/action/stop', Auth.verifyAccess, Controller.stop);

export default router;
