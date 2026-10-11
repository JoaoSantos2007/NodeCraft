import Path from 'path';
import {
  realpath, stat, rename, mkdir, statfs, rm,
} from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { openInsideInstance } from '../utils/verifyPaths.js';
import config from '../../config/config.js';
import Service from '../services/File.js';
import { InvalidRequest, PayloadTooLarge, InsufficientStorage } from '../errors/index.js';
import { treeBytes } from '../middlewares/diskBudget.js';
import { DIRECTORY_BYTES, diskBytes } from '../utils/diskUsage.js';

const reportUsage = async (req, res) => {
  res.setHeader('X-Instance-Disk-Bytes', String(await treeBytes(req.diskBudget.root)));
};

class File {
  static async read(req, res, next) {
    let handle;

    try {
      const path = req.query?.path || '';
      const toDownload = req.query?.download === 'true';

      const instancePath = await realpath(Path.join(config.paths.instances, req.params.id));
      const fullPath = Path.join(instancePath, path);

      const opened = await openInsideInstance(instancePath, fullPath);
      handle = opened.handle;
      const pathType = opened.stats.isFile() ? 'file' : 'directory';

      let content;
      if (pathType === 'file') {
        if (toDownload) {
          res.attachment(Path.basename(fullPath));
          await pipeline(handle.createReadStream({ autoClose: false }), res);
          return undefined;
        }

        content = await handle.readFile('utf8');
      } else if (toDownload) {
        res.attachment(`${Path.basename(fullPath)}.zip`);
        await Service.streamZip(res, [fullPath], instancePath);
        return undefined;
      } else {
        content = await Service.readOneDirectory(fullPath, true, instancePath);
      }

      return res.status(200).json({
        success: true, path, type: pathType, content,
      });
    } catch (err) {
      if (res.headersSent) {
        res.destroy(err);
        return undefined;
      }

      return next(err);
    } finally {
      if (handle) await handle.close();
    }
  }

  static async create(req, res, next) {
    try {
      const { destiny } = req.query;
      const body = req?.body;

      const instancePath = Path.join(config.paths.instances, req.params.id);
      const fullDestiny = Path.join(instancePath, destiny);

      if (body.type === 'file') {
        const content = body.content || '';
        await req.diskBudget.check(Math.max(DIRECTORY_BYTES, Buffer.byteLength(content)));
        await Service.createFile(fullDestiny, content);
      }
      if (body.type === 'directory') {
        await req.diskBudget.check(DIRECTORY_BYTES);
        await mkdir(fullDestiny);
      }

      await reportUsage(req, res);

      return res.status(201).json({
        success: true,
        destiny,
      });
    } catch (err) {
      return next(err);
    }
  }

  static async upload(req, res, next) {
    try {
      const { destiny } = req.query;

      const size = diskBytes(await stat(req.tempUploadPath));
      if (size > req.diskBudget.remainingBytes) {
        throw new PayloadTooLarge('Upload exceeds the owner disk quota!');
      }
      await rename(req.tempUploadPath, req.uploadTarget);
      await reportUsage(req, res);

      return res.status(201).json({
        success: true,
        destiny,
      });
    } catch (err) {
      return next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { path } = req.query;
      const { content } = req.body;

      const instancePath = Path.join(config.paths.instances, req.params.id);
      const fullPath = Path.join(instancePath, path);

      const pathType = await Service.getType(fullPath);

      if (pathType !== 'file') throw new InvalidRequest('This path must be a file');

      const oldSize = diskBytes(await stat(fullPath));
      const newSize = Math.max(DIRECTORY_BYTES, Buffer.byteLength(content));
      await req.diskBudget.check(Math.max(0, newSize - oldSize));
      await Service.replaceFile(fullPath, content, req.diskBudget.root);

      await reportUsage(req, res);

      return res.status(200).json({
        success: true,
        path,
        content,
      });
    } catch (err) {
      return next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { path } = req.query;

      const instancePath = Path.join(config.paths.instances, req.params.id);
      const fullPath = Path.join(instancePath, path);

      await rm(fullPath, { recursive: true });

      await reportUsage(req, res);

      return res.status(200).json({
        success: true,
        path,
      });
    } catch (err) {
      return next(err);
    }
  }

  static async transfer(req, res, next) {
    try {
      const { path, destiny } = req.query;
      const actions = req.query?.actions || '';

      const instancePath = Path.join(config.paths.instances, req.params.id);
      const fullPath = Path.join(instancePath, path);
      const fullDestiny = Path.join(instancePath, destiny);

      if (actions === 'move') await rename(fullPath, fullDestiny);
      else if (actions === 'copy') {
        const size = await treeBytes(fullPath);
        if (size > config.files.maxOperationBytes) {
          throw new PayloadTooLarge('Copy exceeds the operation limit!');
        }
        await req.diskBudget.check(size);
        const limit = Math.min(size, req.diskBudget.remainingBytes, config.files.maxOperationBytes);
        await Service.copy(fullPath, fullDestiny, instancePath, limit);
      } else throw new InvalidRequest('Transfer action is invalid!');

      await reportUsage(req, res);

      return res.status(200).json({
        success: true,
        path,
        destiny,
      });
    } catch (err) {
      return next(err);
    }
  }

  static async unzip(req, res, next) {
    try {
      const { path, destiny } = req.query;

      const instancePath = Path.join(config.paths.instances, req.params.id);
      const fullPath = Path.join(instancePath, path);
      const fullDestiny = Path.join(instancePath, destiny);

      // The ZIP signature and contents are read through the same verified handle.
      const free = await statfs(req.diskBudget.root);
      const available = free.bavail * free.bsize - config.files.minFreeBytes;
      if (available <= 0) throw new InsufficientStorage('No disk space is available for extraction!');
      const quotaLimit = Math.min(req.diskBudget.remainingBytes, config.files.maxOperationBytes);
      const maxBytes = Math.floor(Math.min(quotaLimit, available));
      await Service.unzip(fullPath, fullDestiny, instancePath, maxBytes);

      await reportUsage(req, res);

      return res.status(200).json({
        success: true,
        uncompressing: true,
        path,
        destiny,
        name: Path.basename(fullDestiny),
      });
    } catch (err) {
      return next(err);
    }
  }
}

export default File;
