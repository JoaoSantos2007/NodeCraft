import { Router } from 'express';
import Auth from '../controller/Auth.js';

const router = Router();

router
  .post('/auth/login', Auth.login);

export default router;
