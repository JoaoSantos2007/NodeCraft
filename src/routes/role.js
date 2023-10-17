import { Router } from 'express';
import Role from '../controller/Role.js';

const router = Router();

router
  .get('/role', Role.read)
  .get('/role/:id', Role.readById)
  .post('/role', Role.create)
  .put('/role/:id', Role.update)
  .delete('/role/:id', Role.delete);

export default router;
