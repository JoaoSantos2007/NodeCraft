import { Router } from 'express';
import Player from '../controller/Player.js';

const router = Router();

router
  .get('/:instanceId/player', Player.readAll)
  .get('/:instanceId/player/:playerId', Player.readOne)
  .post('/:instanceId/player', Player.add)
  .put('/:instanceId/player/:playerId', Player.update)
  .delete('/:instanceId/player/:playerId', Player.delete);

export default router;
