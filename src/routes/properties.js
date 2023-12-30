import { Router } from 'express';
import Properties from '../controller/Properties.js';

const router = Router();

router
  .get('/:id/properties', Properties.read)
  .put('/:id/properties', Properties.update);

export default router;
