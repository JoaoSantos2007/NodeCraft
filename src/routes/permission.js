import { Router } from 'express';
import Permission from '../controller/Permission.js';

const router = Router();

router
  .get('/permission', Permission.readAll)
  .get('/permission/:id', Permission.readById)
  .post('/permission', Permission.create)
  .put('/permission/:id', Permission.update)
  .delete('/permission/:id', Permission.delete);

export default router;
