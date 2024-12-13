import { Router } from 'express';
import Controller from '../controllers/User.js';
import Auth from '../middlewares/Auth.js';

const router = Router();

router
  .get('/user', Auth.verifyLogged, Controller.read)
  .get('/user/all', Auth.verifyLogged, Controller.readMany)
  .get('/user/:id', Auth.verifyLogged, Controller.readById)
  .post('/user', Controller.create)
  .put('/user', Auth.verifyLogged, Controller.update)
  .put('/user/:id', Auth.verifyAdmin, Controller.updateOther)
  .delete('/user', Auth.verifyLogged, Controller.delete)
  .delete('/user/:id', Auth.verifyAdmin, Controller.deleteOther);

export default router;
