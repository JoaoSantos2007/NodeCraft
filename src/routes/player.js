import { Router } from 'express';
import Controller from '../controllers/Player.js';
import Auth from '../middlewares/Auth.js';

const router = Router();

router
  .get('/:instanceId/player', Auth.verifyLogged, Controller.readAll)
  .get('/:instanceId/player/:playerId', Auth.verifyLogged, Controller.readOne)
  .post('/:instanceId/player', Auth.verifyAccess, Controller.add)
  .put('/:instanceId/player/:playerId', Auth.verifyAccess, Controller.update)
  .delete('/:instanceId/player/:playerId', Auth.verifyAccess, Controller.delete);

export default router;
