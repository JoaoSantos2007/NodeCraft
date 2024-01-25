import { Router } from 'express';
import Controller from '../controller/File.js';
import Middleware from '../middlewares/File.js';

const router = Router();

router
  .get('/:id/file', Controller.read)
  .get('/:id/file/:path*', Middleware.veryPath, Controller.read)
  .post('/:id/file', Controller.create)
  .post('/:id/file/:path*', Middleware.veryPath, Controller.create)
  .put('/:id/file/:path*', Middleware.veryPath, Controller.update)
  .delete('/:id/file/:path*', Middleware.veryPath, Controller.delete);

export default router;
