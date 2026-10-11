import {
  access,
  realpath,
  lstat,
  mkdir,
  stat,
  rm,
  readFile,
  readdir,
  writeFile,
  rename,
  mkdtemp,
  statfs,
  link,
} from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import * as unzipper from 'unzipper';
import { createWriteStream } from 'node:fs';
import { Transform } from 'node:stream';
import { pipeline, finished } from 'node:stream/promises';
import Path from 'path';
import archiver from 'archiver';
import logger from '../../config/logger.js';
import config from '../../config/config.js';

import { openInsideInstance, visitInstanceFiles } from '../utils/verifyPaths.js';
import { DIRECTORY_BYTES, diskBytes } from '../utils/diskUsage.js';
import { InvalidRequest, PayloadTooLarge, InsufficientStorage } from '../errors/index.js';

const TEMP_LIFETIME = 900000;

const byteLimiter = (limit, counter) => new Transform({
  transform(chunk, encoding, callback) {
    const state = counter;
    state.written += chunk.length;

    callback(state.written > limit ? new PayloadTooLarge('Operation exceeds the disk limit!') : null, chunk);
  },
});

const withStagedPath = async (destinyPath, prefix, writePayload) => {
  const stage = await mkdtemp(Path.join(Path.dirname(destinyPath), prefix));
  const output = Path.join(stage, 'payload');

  try {
    await writePayload(output);
    await rename(output, destinyPath);
    return true;
  } finally {
    await rm(stage, { recursive: true, force: true });
  }
};

const copyEntry = async ({ handle, stats, name }, output, counter, maxBytes) => {
  const target = Path.join(output, name);

  if (stats.isDirectory()) {
    await mkdir(target, { recursive: true });
    return;
  }

  await mkdir(Path.dirname(target), { recursive: true });
  await pipeline(
    handle.createReadStream({ autoClose: false }),
    byteLimiter(maxBytes, counter),
    createWriteStream(target, { flags: 'wx' }),
  );
};

const chargeZipBytes = (counter, maxBytes) => {
  const state = counter;
  state.written += DIRECTORY_BYTES;
  if (state.written > maxBytes) throw new PayloadTooLarge('ZIP exceeds the disk limit!');
};

const zipEntryTarget = (output, name) => {
  const target = Path.resolve(output, name);
  const relative = Path.relative(output, target);

  if (!name || name.includes('\\') || name.includes('\0') || Path.isAbsolute(name)
    || relative === '..' || relative.startsWith(`..${Path.sep}`) || Path.isAbsolute(relative)) {
    throw new InvalidRequest('ZIP contains an invalid path!');
  }

  return target;
};

const ensureZipDirectories = async (output, target, directories, counter, maxBytes) => {
  const relative = Path.relative(output, target);
  if (!relative) return;

  let current = output;
  for (const part of relative.split(Path.sep)) {
    current = Path.join(current, part);

    if (!directories.has(current)) {
      chargeZipBytes(counter, maxBytes);
      await mkdir(current);
      directories.add(current);
    }
  }
};

const extractZipEntry = async (entry, output, directories, counter, maxBytes) => {
  const target = zipEntryTarget(output, entry.path);

  if (entry.type === 'Directory') {
    await ensureZipDirectories(output, target, directories, counter, maxBytes);
    entry.autodrain();
  } else if (entry.type === 'File') {
    await ensureZipDirectories(output, Path.dirname(target), directories, counter, maxBytes);
    chargeZipBytes(counter, maxBytes);
    await pipeline(entry, byteLimiter(maxBytes, counter), createWriteStream(target, { flags: 'wx' }));
  } else {
    throw new InvalidRequest('ZIP contains an unsupported entry!');
  }
};

const extractZipArchive = async (handle, output, maxBytes) => {
  const counter = { written: DIRECTORY_BYTES };
  const directories = new Set([output]);
  let entries = 0;

  await mkdir(output);
  if (counter.written > maxBytes) throw new PayloadTooLarge('ZIP exceeds the disk limit!');

  const archive = handle.createReadStream({ start: 0, autoClose: false })
    .pipe(unzipper.Parse({ forceStream: true }));

  for await (const entry of archive) {
    entries += 1;
    if (entries > 10000) throw new PayloadTooLarge('ZIP has too many entries!');
    await extractZipEntry(entry, output, directories, counter, maxBytes);
  }
};

class File {
  static async createFile(path, content) {
    const temp = Path.join(Path.dirname(path), `.nodecraft-create-${randomUUID()}`);

    try {
      await writeFile(temp, content, { flag: 'wx' });
      await link(temp, path);
    } finally {
      await rm(temp, { force: true });
    }
  }

  static async replaceFile(path, content, root) {
    const free = await statfs(root);

    if (Buffer.byteLength(content) + config.files.minFreeBytes > free.bavail * free.bsize) {
      throw new InsufficientStorage('No disk space is available to edit this file!');
    }

    const temp = Path.join(Path.dirname(path), `.nodecraft-edit-${randomUUID()}`);
    try {
      await writeFile(temp, content, { flag: 'wx' });
      await rename(temp, path);
    } finally {
      await rm(temp, { force: true });
    }
  }

  static async verifyExists(path) {
    try {
      await access(path);

      return true;
    } catch (err) {
      return false;
    }
  }

  static async getType(path) {
    try {
      const stats = await stat(path);

      if (stats.isFile()) return 'file';
      if (stats.isDirectory()) return 'directory';

      return 'other';
    } catch (err) {
      return null;
    }
  }

  static async getSize(path) {
    try {
      const stats = await stat(path);
      const sizeMb = stats.size / (1024 * 1024);

      return sizeMb;
    } catch (err) {
      logger.error({ err }, 'Error to get path size');

      return 0;
    }
  }

  // Recursively sum the size of a directory tree, in MB.
  static async getDirSize(path) {
    let bytes = 0;

    await visitInstanceFiles(path, '', async ({ stats }) => {
      bytes += diskBytes(stats);
    });

    return bytes / (1024 * 1024);
  }

  static async readOneFile(path, instancePath = null) {
    if (instancePath) {
      const root = await realpath(instancePath);
      const { handle, stats } = await openInsideInstance(root, path);

      try {
        if (!stats.isFile()) throw new InvalidRequest('The path must be a file!');

        return await handle.readFile('utf8');
      } finally {
        await handle.close();
      }
    }

    try {
      const rawData = await readFile(path, 'utf8');

      return rawData;
    } catch (err) {
      logger.error({ err }, 'Error to read a file');

      return '';
    }
  }

  static async readOneDirectory(path, detailed = false, instancePath = null) {
    if (instancePath) {
      const root = await realpath(instancePath);
      const { handle, stats } = await openInsideInstance(root, path);

      try {
        if (!stats.isDirectory()) throw new InvalidRequest('The path must be a directory!');

        const directory = `/proc/self/fd/${handle.fd}`;
        const items = await readdir(directory);
        if (!detailed) return items;

        const result = [];
        for (const name of items) {
          const child = await openInsideInstance(root, Path.join(directory, name));

          try {
            result.push({ name, type: child.stats.isDirectory() ? 'directory' : 'file' });
          } finally {
            await child.handle.close();
          }
        }
        return result;
      } finally {
        await handle.close();
      }
    }

    try {
      const items = await readdir(path, 'utf8');

      if (!detailed) return items || [];

      const result = [];
      for (const item of items) {
        result.push({
          name: item,
          type: await File.getType(Path.join(path, item)),
        });
      }

      return result;
    } catch (err) {
      logger.error({ err }, 'Error to read a directory');

      return [];
    }
  }

  static async createTemp() {
    const timestamp = new Date().getTime();
    const tempPath = Path.join(config.paths.temp, String(timestamp));

    await File.createOneDirectory(tempPath);
    return tempPath;
  }

  static async createOneFile(path, data) {
    try {
      await writeFile(path, data, 'utf8');

      return true;
    } catch (err) {
      logger.error({ err }, 'Error to create a file');
      return false;
    }
  }

  static async createOneDirectory(path) {
    try {
      await mkdir(path, { recursive: true });

      return true;
    } catch (err) {
      logger.error({ err }, 'Error to create a directory');

      return false;
    }
  }

  static async copy(originPath, destinyPath, instancePath, maxBytes) {
    const relative = Path.relative(originPath, destinyPath);

    if (!relative.startsWith('..') && !Path.isAbsolute(relative)) {
      throw new InvalidRequest('A directory cannot be copied into itself!');
    }

    return withStagedPath(destinyPath, '.nodecraft-copy-', async (output) => {
      const counter = { written: 0 };
      await visitInstanceFiles(instancePath, Path.relative(instancePath, originPath), (entry) => (
        copyEntry(entry, output, counter, maxBytes)
      ));
    });
  }

  static async move(originPath, destinyPath) {
    try {
      await rename(originPath, destinyPath);

      return true;
    } catch (err) {
      logger.error({ err }, 'Error to move paths');

      return false;
    }
  }

  static async delete(path) {
    try {
      await rm(path, { recursive: true, force: true });
    } catch (err) {
      logger.error({ err }, 'Error to delete file');
    }
  }

  static async removeOldTemp() {
    try {
      const tempPath = config.paths.temp;

      // Verify if temporary path exists
      if (!(await File.verifyExists(tempPath))) return;

      // Read temporary path items
      const items = await File.readOneDirectory(tempPath);

      // Get timestamp
      const now = Date.now();

      for (const item of items) {
        const createdAt = Number(item);

        if (!Number.isInteger(createdAt) || now - createdAt >= TEMP_LIFETIME) {
          await File.delete(Path.join(tempPath, item));
        }
      }
    } catch (err) {
      logger.error({ err }, 'Error to remove old temp paths');
    }
  }

  static async makeZip(outputPath, paths, instancePath) {
    const output = createWriteStream(outputPath);
    try {
      await File.streamZip(output, paths, instancePath);
      return outputPath;
    } catch (err) {
      await rm(outputPath, { force: true });
      throw err;
    }
  }

  static async streamZip(output, paths, instancePath) {
    const archive = archiver('zip', { zlib: { level: 6 } });

    // Attach immediately: traversal can fail while the output is also failing.
    const completion = pipeline(archive, output);
    completion.catch(() => {});

    try {
      for (const itemPath of paths) {
        // Backup definitions include optional files. Broken links are not missing files.
        try {
          await lstat(itemPath);
        } catch (err) {
          if (err.code === 'ENOENT') continue;
          throw err;
        }

        const prefix = Path.basename(itemPath);
        const relativePath = Path.relative(instancePath, itemPath);
        await visitInstanceFiles(instancePath, relativePath, async ({ handle, stats, name }) => {
          const entryName = Path.join(prefix, name);
          if (stats.isDirectory()) {
            archive.append('', { name: `${entryName}/` });
            return;
          }

          const stream = handle.createReadStream({ autoClose: false });
          try {
            archive.append(stream, { name: entryName });
            await Promise.race([finished(stream), completion]);
          } finally {
            stream.destroy();
          }
        });
      }

      await archive.finalize();
      await completion;
      return true;
    } catch (err) {
      archive.destroy(err);
      output.destroy(err);
      await completion.catch(() => {});
      throw err;
    }
  }

  static async unzip(fromZip, toPath, instancePath, maxBytes) {
    const root = await realpath(instancePath);
    const { handle, stats } = await openInsideInstance(root, fromZip);

    try {
      if (!stats.isFile()) throw new InvalidRequest('The path must be a ZIP file!');

      const signature = Buffer.alloc(4);
      await handle.read(signature, 0, 4, 0);
      if (!signature.equals(Buffer.from([0x50, 0x4B, 0x03, 0x04]))) {
        throw new InvalidRequest('The file is not a ZIP!');
      }

      return await withStagedPath(toPath, '.nodecraft-unzip-', (output) => (
        extractZipArchive(handle, output, maxBytes)
      ));
    } finally {
      await handle.close();
    }
  }

  static async makeBackup(instance) {
    const instancePath = Path.join(config.paths.instances, String(instance.id));

    const backupPaths = {
      minecraft: [
        Path.join(instancePath, 'world'),
        Path.join(instancePath, 'world_nether'),
        Path.join(instancePath, 'world_the_end'),
        Path.join(instancePath, 'server.properties'),
        Path.join(instancePath, 'spigot.yml'),
        Path.join(instancePath, 'bukkit.yml'),
        Path.join(instancePath, 'config'),
      ],
      terraria: [
        Path.join(instancePath, 'Worlds'),
      ],
      kerbal: [
        Path.join(instancePath, 'Universe'),
        Path.join(instancePath, 'Config'),
      ],
      hytale: [
        Path.join(instancePath, 'universe'),
        Path.join(instancePath, 'config.json'),
      ],
    };

    const paths = backupPaths[instance.type];
    if (!paths) throw new Error(`No backup paths defined for game type: ${instance.type}`);

    const tempPath = await File.createTemp();
    const backupName = `backup-${Date.now()}.zip`;
    const backupPath = Path.join(tempPath, backupName);

    await File.makeZip(backupPath, paths, instancePath);

    const backupSize = await File.getSize(backupPath);

    return { backupPath, backupSize };
  }
}

export default File;
