import { Router } from 'express';
import Auth from '../middlewares/Auth.js';
import Controller from '../controllers/Settings.js';

const router = Router();

router
  .get('/settings', Auth.verifyAdmin, Controller.read)
  .put('/settings', Auth.verifyAdmin, Controller.update);

export default router;
