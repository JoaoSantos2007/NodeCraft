import { Router } from 'express';
import Controller from '../controller/File.js';
import Middleware from '../middlewares/File.js';

const router = Router();

router
  .get('/:id/file', Middleware.veryPath, Controller.read)
  .get('/:id/file/:path*', Middleware.veryPath, Controller.read)
  .post('/:id/file/:path*', Middleware.veryNewPath, Controller.create)
  .put('/:id/file/:path*', Middleware.veryPath, Controller.update)
  .delete('/:id/file/:path*', Middleware.veryPath, Controller.delete);

export default router;
