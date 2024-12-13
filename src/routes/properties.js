import { Router } from 'express';
import Controller from '../controllers/Properties.js';
import Auth from '../middlewares/Auth.js';

const router = Router();

router
  .get('/:id/properties', Auth.verifyAccess, Controller.read)
  .put('/:id/properties', Auth.verifyAccess, Controller.update);

export default router;
