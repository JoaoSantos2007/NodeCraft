import { Router } from 'express';
import Instance from '../controller/Instance.js';

const router = Router();

router
  .get('/instance', Instance.readAll)
  .get('/instance/:id', Instance.readOne)
  .post('/instance', Instance.create)
  .put('/instance/:id', Instance.update)
  .delete('/instance/:id', Instance.delete)
  .post('/instance/run/:id', Instance.run)
  .post('/instance/stop/:id', Instance.stop);

export default router;
