import { Router } from 'express';
import Controller from '../controller/Instance.js';
import Middleware from '../middlewares/Instance.js';
import player from './player.js';
import properties from './properties.js';
import world from './world.js';
import action from './action.js';
import file from './file.js';
import Auth from '../middlewares/Auth.js';

const router = Router();

router
  .get('/instance', Auth.verifyLogged, Controller.readAll)
  .get('/instance/:id', Auth.verifyLogged, Controller.readOne)
  .post('/instance', Auth.verifyAdmin, Controller.create)
  .post('/instance/:version', Auth.verifyAdmin, Controller.create)
  .put('/instance/:id', Auth.verifyAccess, Middleware.verifyInProgress, Controller.update)
  .delete('/instance/:id', Auth.verifyAdmin, Middleware.verifyInProgress, Controller.delete)
  .use('/instance', action)
  .use('/instance', properties)
  .use('/instance', world)
  .use('/instance', player)
  .use('/instance', file);

export default router;
