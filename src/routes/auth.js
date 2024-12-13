import { Router } from 'express';
import Controller from '../controllers/Auth.js';

const router = Router();

router
  .post('/auth/login', Controller.login);

export default router;
