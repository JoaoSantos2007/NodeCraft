import multer from 'multer';
import Path from 'path';
import { statfs, rm } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import config from '../../config/config.js';
import { InvalidRequest, PayloadTooLarge, InsufficientStorage } from '../errors/index.js';
import { DIRECTORY_BYTES } from '../utils/diskUsage.js';

const storage = multer.diskStorage({
  destination(req, file, cb) {
    try {
      const destiny = req.query?.destiny;

      const istancePath = Path.join(config.paths.instances, req.params.id);
      const fullDestiny = Path.join(istancePath, destiny);

      req.uploadTarget = fullDestiny;
      req.filename = `.nodecraft-upload-${randomUUID()}`;
      req.saveUploadPath = Path.dirname(fullDestiny);
      req.tempUploadPath = Path.join(req.saveUploadPath, req.filename);

      cb(null, req.saveUploadPath);
    } catch (err) {
      cb(err);
    }
  },

  filename(req, file, cb) {
    try {
      cb(null, req.filename);
    } catch (err) {
      cb(err);
    }
  },
});

export default async (req, res, next) => {
  try {
    const free = await statfs(req.diskBudget.root);

    const allowed = Math.floor(Math.min(
      config.files.maxUploadBytes,
      req.diskBudget.remainingBytes,
      free.bavail * free.bsize - config.files.minFreeBytes,
    ));

    if (free.bavail * free.bsize <= config.files.minFreeBytes) {
      throw new InsufficientStorage('No disk space is available for this upload!');
    }

    if (req.diskBudget.remainingBytes < DIRECTORY_BYTES) {
      throw new PayloadTooLarge('No owner quota is available for this upload!');
    }

    if (allowed <= 0) throw new PayloadTooLarge('No owner quota is available for this upload!');

    const cleanup = () => {
      if (req.tempUploadPath) rm(req.tempUploadPath, { force: true }).catch(() => {});
    };

    res.once('close', cleanup);
    req.once('aborted', cleanup);

    multer({
      storage,
      limits: {
        fileSize: allowed, files: 1, fields: 0, parts: 1,
      },
    })
      .single('file')(req, res, (err) => {
        if (err?.code === 'LIMIT_FILE_SIZE') {
          cleanup();
          return next(new PayloadTooLarge('Upload exceeds the disk limit!'));
        }

        if (err instanceof multer.MulterError) {
          cleanup();
          return next(new InvalidRequest(err.message));
        }

        if (err) {
          cleanup();
          return next(err);
        }

        if (!req.file) return next(new InvalidRequest('A file is required!'));

        return next();
      });
  } catch (err) {
    next(err);
  }
};
