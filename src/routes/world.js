import { Router } from 'express';
import Instance from '../middlewares/Instance.js';
import { worldValidator, worldUploader } from '../middlewares/World.js';
import World from '../controller/World.js';

const router = Router();

router
  .get('/:id/world', worldValidator, World.download)
  .put('/:id/world', worldValidator, Instance.verifyInProgress, worldUploader.single('world'), World.upload)
  .delete('/:id/world', worldValidator, Instance.verifyInProgress, World.delete);

export default router;
