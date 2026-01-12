import { Router } from 'express';
import Controller from '../controllers/File.js';
import Middleware from '../middlewares/File.js';
import auth from '../middlewares/auth.js';
import uploader from '../middlewares/uploader.js';

const router = Router();

router
  .get( // Read root files/folders
    '/:id/file',
    (req, res, next) => auth('instance:file:read', req, res, next),
    Middleware.verifyPath,
    Controller.read,
  )
  .get( // Read content or Download files/folders
    '/:id/file/*path',
    // (req, res, next) => auth('instance:file:read', req, res, next),
    Middleware.verifyPath,
    Controller.read,
  )
  .post( // Unzip files
    '/:id/file/*path/actions/unzip',
    (req, res, next) => auth('instance:file:unzip', req, res, next),
    Middleware.verifyPath,
    Controller.unzip,
  )
  .post( // Create or Upload files/folders
    '/:id/file/*path',
    (req, res, next) => auth('instance:file:create', req, res, next),
    Middleware.verifyRunning,
    Middleware.verifyNewPath,
    uploader.single('file'),
    Controller.create,
  )
  .put( // Update files content
    '/:id/file/*path',
    (req, res, next) => auth('instance:file:update', req, res, next),
    Middleware.verifyRunning,
    Middleware.verifyPath,
    Controller.update,
  )
  .delete( // Delete files/folders
    '/:id/file/*path',
    (req, res, next) => auth('instance:file:delete', req, res, next),
    Middleware.verifyRunning,
    Middleware.verifyPath,
    Controller.delete,
  )
  .patch( // Move files/folders
    '/:id/file/*path/to/*destiny',
    (req, res, next) => auth('instance:file:move', req, res, next),
    Middleware.verifyRunning,
    Middleware.verifyPath,
    Middleware.verifyDestiny,
    Controller.move,
  );

export default router;
