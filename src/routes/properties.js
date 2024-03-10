import { Router } from 'express';
import Properties from '../controller/Properties.js';
import Auth from '../middlewares/Auth.js';

const router = Router();

router
  .get('/:id/properties', Auth.verifyAccess, Properties.read)
  .put('/:id/properties', Auth.verifyAccess, Properties.update);

export default router;
