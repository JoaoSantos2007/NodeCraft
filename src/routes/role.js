import { Router } from 'express';
import Controller from '../controllers/Role.js';

const router = Router();

router
  .get('/:groupId/role', Controller.readAll)
  .get('/:groupId/role/:roleId', Controller.readOne)
  .post('/:groupId/role', Controller.create)
  .put('/:groupId/role/:roleId', Controller.update)
  .delete('/groupId/role/:roleId', Controller.delete);

export default router;
