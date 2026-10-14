import multer from 'multer';
import Path from 'path';
import { statfs, rm } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { randomUUID } from 'node:crypto';
import { openDirectory } from '../utils/mutatePaths.js';
import config from '../../config/config.js';
import { InvalidRequest, PayloadTooLarge, InsufficientStorage } from '../errors/index.js';
import { DIRECTORY_BYTES } from '../utils/diskUsage.js';

const storage = {
  // Multer storage engine interface.
  // eslint-disable-next-line no-underscore-dangle
  _handleFile(req, file, cb) {
    const output = createWriteStream(req.tempUploadPath, { flags: 'wx' });
    req.uploadWrite = pipeline(file.stream, output).then(() => cb(null, {
      path: req.tempUploadPath,
      filename: req.filename,
      destination: req.saveUploadPath,
      size: output.bytesWritten,
    }), cb);
  },

  // eslint-disable-next-line no-underscore-dangle
  _removeFile(req, file, cb) {
    req.cleanupUpload().then(() => cb(null), cb);
  },
};

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

    const fullDestiny = Path.join(config.paths.instances, req.params.id, req.query.destiny);
    const directory = await openDirectory(Path.dirname(fullDestiny));
    req.uploadTarget = fullDestiny;
    req.filename = `.nodecraft-upload-${randomUUID()}`;
    req.saveUploadPath = `/proc/self/fd/${directory.fd}`;
    req.tempUploadPath = Path.join(req.saveUploadPath, req.filename);

    let cleanupPromise;
    let uploading = true;
    let closed = false;
    req.cleanupUpload = () => {
      if (!cleanupPromise) {
        cleanupPromise = (req.uploadWrite || Promise.resolve()).catch(() => {})
          .then(() => rm(req.tempUploadPath, { force: true }))
          .finally(() => directory.close());
      }
      return cleanupPromise;
    };
    // Closing a descriptor while multer is still using its path could redirect
    // later cleanup to an unrelated, reused fd. Wait for its callback first.
    const cleanup = () => req.cleanupUpload().catch(() => {});
    const onClose = () => {
      closed = true;
      if (!uploading) cleanup();
    };
    res.once('close', onClose);
    req.once('aborted', onClose);

    multer({
      storage,
      limits: {
        fileSize: allowed, files: 1, fields: 0, parts: 2,
      },
    })
      .single('file')(req, res, (err) => {
        uploading = false;
        res.removeListener('close', onClose);
        req.removeListener('aborted', onClose);
        if (closed) {
          cleanup();
          return undefined;
        }
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

        if (!req.file) {
          cleanup();
          return next(new InvalidRequest('A file is required!'));
        }

        return next();
      });
  } catch (err) {
    if (req.cleanupUpload) await req.cleanupUpload().catch(() => {});
    next(err);
  }
};
