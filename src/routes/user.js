import { Router } from 'express';
import User from '../controller/User.js';
import Auth from '../middlewares/Auth.js';

const router = Router();

router
  .get('/user', Auth.verifyLogged, User.read)
  .get('/user/all', Auth.verifyLogged, User.readMany)
  .get('/user/:id', Auth.verifyLogged, User.readById)
  .post('/user', User.create)
  .put('/user', Auth.verifyLogged, User.update)
  .put('/user/:id', Auth.verifyAdmin, User.updateOther)
  .delete('/user', Auth.verifyLogged, User.delete)
  .delete('/user/:id', Auth.verifyAdmin, User.deleteOther);

export default router;
