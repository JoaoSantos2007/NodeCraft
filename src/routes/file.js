import { Router } from 'express';
import Controller from '../controllers/File.js';
import Middleware from '../middlewares/File.js';
import Auth from '../middlewares/Auth.js';
import Instance from '../middlewares/Instance.js';
import uploader from '../middlewares/uploader.js';

const router = Router();

router
  .get('/:id/file', Auth.verifyAccess, Middleware.verifyPath, Controller.read) // Read root files/folders
  .get('/:id/file/:path*', Auth.verifyAccess, Middleware.verifyPath, Controller.read) // Read content or Download files/folders
  .post('/:id/file/:path*/actions/unzip', Auth.verifyAccess, Middleware.verifyPath, Controller.unzip) // Unzip files
  .post('/:id/file/:path*', Auth.verifyAccess, Instance.verifyInProgress, Middleware.verifyNewPath, uploader.single('file'), Controller.create) // Create or Upload files/folders
  .put('/:id/file/:path*', Auth.verifyAccess, Instance.verifyInProgress, Middleware.verifyPath, Controller.update) // Update files content
  .delete('/:id/file/:path*', Auth.verifyAccess, Instance.verifyInProgress, Middleware.verifyPath, Controller.delete) // Delete files/folders
  .patch('/:id/file/:path*/to/:destiny*', Auth.verifyAccess, Instance.verifyInProgress, Middleware.verifyPath, Middleware.verifyDestiny, Controller.move); // Move files/folders

export default router;
