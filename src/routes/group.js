import { Router } from 'express';
import Contoller from '../controller/Group.js';
import role from './role.js';

const router = Router();

router
  .get('/group', Contoller.readAll)
  .get('/group/:id', Contoller.readOne)
  .post('/group', Contoller.create)
  .put('/group/:id', Contoller.update)
  .delete('/group/:id', Contoller.delete)
  .use('/group', role);

export default router;
