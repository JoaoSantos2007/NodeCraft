import { Router } from 'express';
import Contoller from '../controllers/Group.js';
import role from './role.js';
import member from './member.js';

const router = Router();

router
  .get('/group', Contoller.readAll)
  .get('/group/:id', Contoller.readOne)
  .post('/group', Contoller.create)
  .put('/group/:id', Contoller.update)
  .delete('/group/:id', Contoller.delete)
  .use('/group', role)
  .use('/group', member);

export default router;
