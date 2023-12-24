import { Router } from 'express';
import FriendZone from '../controller/FriendZone.js';

const router = Router();

router
  .get('/friendzone/:instanceId', FriendZone.read)
  .get('/friendzone/:instanceId/:userId', FriendZone.readSpecific)
  .post('/friendzone/:instanceId', FriendZone.add)
  .put('/friendzone/:instanceId/:userId', FriendZone.update)
  .delete('/friendzone/:instanceId/:userId', FriendZone.remove);

export default router;
