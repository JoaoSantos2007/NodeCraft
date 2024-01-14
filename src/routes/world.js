import { Router } from 'express';
import Instance from '../middlewares/Instance.js';
import worldUploader from '../middlewares/World.js';
import World from '../controller/World.js';

const router = Router();

router
  .get('/:id/world', Instance.verifyInProgress, World.download)
  .put('/:id/world', Instance.verifyInProgress, worldUploader.single('world'), World.upload)
  .delete('/:id/world', Instance.verifyInProgress, World.delete);

export default router;
