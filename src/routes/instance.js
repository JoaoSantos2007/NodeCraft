import { Router } from 'express';
import InstanceController from '../controller/Instance.js';
import InstanceMiddleware from '../middlewares/Instance.js';
import worldUploader from '../middlewares/World.js';
import player from './player.js';
import properties from './properties.js';

const router = Router();

router
  .get('/instance', InstanceController.readAll)
  .get('/instance/:id', InstanceController.readOne)
  .post('/instance', InstanceController.create)
  .post('/instance/:version', InstanceController.create)
  .put('/instance/:id', InstanceMiddleware.verifyInProgress, InstanceController.update)
  .delete('/instance/:id', InstanceMiddleware.verifyInProgress, InstanceController.delete)
  .post('/instance/run/:id', InstanceMiddleware.verifyInProgress, InstanceController.run)
  .post('/instance/stop/:id', InstanceController.stop)
  .get('/instance/world/:id', InstanceMiddleware.verifyInProgress, InstanceController.downloadWorld)
  .post('/instance/world/:id', InstanceMiddleware.verifyInProgress, worldUploader.single('world'), InstanceController.uploadWorld)
  .post('/instance/update/:id', InstanceMiddleware.verifyInProgress, InstanceController.updateVersion)
  .use('/instance', properties)
  .use('/instance', player);

export default router;
