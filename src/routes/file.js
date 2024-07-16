import { Router } from 'express';
import Controller from '../controller/File.js';
import Middleware from '../middlewares/File.js';
import Auth from '../middlewares/Auth.js';
import Instance from '../middlewares/Instance.js';
import uploader from '../middlewares/uploader.js';

const router = Router();

router
  .get('/:id/file', Auth.verifyAccess, Middleware.veryPath, Controller.read)
  .get('/:id/file/:path*', Auth.verifyAccess, Middleware.veryPath, Controller.read)
  .post('/:id/file/:path*', Auth.verifyAccess, Instance.verifyInProgress, Middleware.veryNewPath, Controller.create)
  .put('/:id/file/:path*', Auth.verifyAccess, Instance.verifyInProgress, Middleware.veryPath, Controller.update)
  .delete('/:id/file/:path*', Auth.verifyAccess, Instance.verifyInProgress, Middleware.veryPath, Controller.delete)
  .get('/:id/download/file/', Auth.verifyAccess, Middleware.veryPath, Controller.download)
  .get('/:id/download/file/:path*', Auth.verifyAccess, Middleware.veryPath, Controller.download)
  .post('/:id/upload/file/:path*', Auth.verifyAccess, Middleware.veryNewPath, uploader.single('file'), Controller.upload);

export default router;
