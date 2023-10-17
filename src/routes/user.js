import { Router } from 'express';
import User from '../controller/User.js';
import Auth from '../middlewares/Auth.js';

const router = Router();

router
  .get('/user', Auth.verifyAuthorization, User.read)
  .get('/user/all', User.readMany)
  .get('/user/:id', User.readById)
  .post('/user', User.create)
  .put('/user', Auth.verifyAuthorization, User.update)
  .put('/user/:id', Auth.verifyAuthorization, User.updateOther)
  .delete('/user', Auth.verifyAuthorization, User.delete)
  .delete('/user/:id', Auth.verifyAuthorization, User.deleteOther);

export default router;
