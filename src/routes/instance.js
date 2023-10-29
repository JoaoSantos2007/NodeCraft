import { Router } from 'express';
import Instance from '../controller/Instance.js';

const router = Router();

router
  .get('/instance')
  .get('/instance/:id')
  .post('/instance', Instance.create)
  .put('/instance')
  .delete('/instance');

export default router;
