import { Router } from 'express';
import Controller from '../controllers/Member.js';

const router = Router();

router
  .get('/:groupId/member', Controller.readAll)
  .get('/:groupId/member/:memberId', Controller.readOne)
  .post('/:groupId/member', Controller.create)
  .put('/:groupId/member/:memberId', Controller.update)
  .delete('/:groupId/member/:memberId', Controller.delete);

export default router;
