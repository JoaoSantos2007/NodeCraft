import { Router } from 'express';
import Player from '../controller/Player.js';
import Auth from '../middlewares/Auth.js';

const router = Router();

router
  .get('/:instanceId/player', Auth.verifyLogged, Player.readAll)
  .get('/:instanceId/player/:playerId', Auth.verifyLogged, Player.readOne)
  .post('/:instanceId/player', Auth.verifyAccess, Player.add)
  .put('/:instanceId/player/:playerId', Auth.verifyAccess, Player.update)
  .delete('/:instanceId/player/:playerId', Auth.verifyAccess, Player.delete);

export default router;
