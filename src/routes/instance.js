import { Router } from 'express';
import Controller from '../controller/Instance.js';
import Middleware from '../middlewares/Instance.js';
import player from './player.js';
import properties from './properties.js';
import world from './world.js';
import action from './action.js';
import file from './file.js';

const router = Router();

router
  .get('/instance', Controller.readAll)
  .get('/instance/:id', Controller.readOne)
  .post('/instance', Controller.create)
  .post('/instance/:version', Controller.create)
  .put('/instance/:id', Middleware.verifyInProgress, Controller.update)
  .delete('/instance/:id', Middleware.verifyInProgress, Controller.delete)
  .use('/instance', action)
  .use('/instance', properties)
  .use('/instance', world)
  .use('/instance', player)
  .use('/instance', file);

export default router;
