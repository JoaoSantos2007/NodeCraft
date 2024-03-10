import { Router } from 'express';
import Controller from '../controller/File.js';
import Middleware from '../middlewares/File.js';
import Auth from '../middlewares/Auth.js';

const router = Router();

router
  .get('/:id/file', Auth.verifyAccess, Middleware.veryPath, Controller.read)
  .get('/:id/file/:path*', Auth.verifyAccess, Middleware.veryPath, Controller.read)
  .post('/:id/file/:path*', Auth.verifyAccess, Middleware.veryNewPath, Controller.create)
  .put('/:id/file/:path*', Auth.verifyAccess, Middleware.veryPath, Controller.update)
  .delete('/:id/file/:path*', Auth.verifyAccess, Middleware.veryPath, Controller.delete);

export default router;
