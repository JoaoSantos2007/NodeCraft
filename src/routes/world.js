import { Router } from 'express';
import Instance from '../middlewares/Instance.js';
import worldUploader from '../middlewares/World.js';
import World from '../controller/World.js';
import Auth from '../middlewares/Auth.js';

const router = Router();

router
  .get('/:id/world', Auth.verifyAccess, Instance.verifyInProgress, World.download)
  .put('/:id/world', Auth.verifyAccess, Instance.verifyInProgress, worldUploader.single('world'), World.upload)
  .delete('/:id/world', Auth.verifyAccess, Instance.verifyInProgress, World.delete);

export default router;
