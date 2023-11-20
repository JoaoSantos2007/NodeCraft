import { Router } from 'express';
import Java from '../controller/Java.js';

const router = Router();

router
  .get('/java', Java.readAll)
  .get('/java/:id', Java.readOne)
  .post('/java', Java.create)
  .put('/java/:id', Java.update)
  .delete('/java/:id', Java.delete)
  .post('/java/run/:id', Java.run)
  .post('/java/stop/:id', Java.stop);

export default router;
