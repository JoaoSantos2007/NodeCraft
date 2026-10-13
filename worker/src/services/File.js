import {
  access,
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
  opendir,
  open,
} from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import * as unzipper from 'unzipper';
import { createWriteStream } from 'node:fs';
import { Transform, Writable } from 'node:stream';
import { pipeline, finished } from 'node:stream/promises';
import Path from 'path';
import archiver from 'archiver';
import logger from '../../config/logger.js';
import config from '../../config/config.js';
import { withPathParent, openDirectory, removePath } from '../utils/mutatePaths.js';
import { openInsideInstance, visitInstanceFiles } from '../utils/verifyPaths.js';
import { DIRECTORY_BYTES, diskBytes } from '../utils/diskUsage.js';
import { InvalidRequest, PayloadTooLarge, InsufficientStorage } from '../errors/index.js';
import acquireDiskWrite from '../utils/diskWriteLock.js';

const TEMP_LIFETIME = 900000;
const activeBackups = new Set();

const byteLimiter = (limit, counter) => new Transform({
  transform(chunk, encoding, callback) {
    const state = counter;
    state.written += chunk.length;

    callback(state.written > limit ? new PayloadTooLarge('Operation exceeds the disk limit!') : null, chunk);
  },
});

const withStagedPath = async (destinyPath, prefix, writePayload) => {
  const write = async (target) => {
    const stage = await mkdtemp(Path.join(Path.dirname(target), prefix));
    let directory;

    try {
      directory = await openDirectory(stage);
      const output = `/proc/self/fd/${directory.fd}/payload`;
      await writePayload(output);
      await rename(output, target);
      return true;
    } finally {
      try {
        await removePath(stage, true);
      } finally {
        if (directory) await directory.close();
      }
    }
  };
  return withPathParent(destinyPath, write);
};

const copyEntry = async ({ handle, stats, name }, output, counter, maxBytes) => {
  const target = Path.join(output, name);

  if (stats.isDirectory()) {
    await withPathParent(target, (safePath) => mkdir(safePath));
    return;
  }

  await withPathParent(target, (safePath) => pipeline(
    handle.createReadStream({ autoClose: false }),
    byteLimiter(maxBytes, counter),
    createWriteStream(safePath, { flags: 'wx' }),
  ));
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
      await withPathParent(current, (safePath) => mkdir(safePath));
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
    await withPathParent(target, (safePath) => pipeline(entry, byteLimiter(maxBytes, counter), createWriteStream(safePath, { flags: 'wx' })));
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
    return withPathParent(path, async (target) => {
      const temp = Path.join(Path.dirname(target), `.nodecraft-create-${randomUUID()}`);

      try {
        await writeFile(temp, content, { flag: 'wx' });
        await link(temp, target);
      } finally {
        await removePath(temp, true);
      }
    });
  }

  static async replaceFile(path, content, root) {
    const free = await statfs(root);

    if (Buffer.byteLength(content) + config.files.minFreeBytes > free.bavail * free.bsize) {
      throw new InsufficientStorage('No disk space is available to edit this file!');
    }

    return withPathParent(path, async (target) => {
      const temp = Path.join(Path.dirname(target), `.nodecraft-edit-${randomUUID()}`);
      try {
        await writeFile(temp, content, { flag: 'wx' });
        await rename(temp, target);
      } finally {
        await removePath(temp, true);
      }
    });
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
      const root = Path.resolve(instancePath);
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

  static async readOneDirectory(
    path,
    detailed = false,
    instancePath = null,
    maxEntries = Infinity,
  ) {
    if (instancePath) {
      const root = Path.resolve(instancePath);
      const { handle, stats } = await openInsideInstance(root, path);

      try {
        if (!stats.isDirectory()) throw new InvalidRequest('The path must be a directory!');

        const directory = `/proc/self/fd/${handle.fd}`;
        const result = [];
        for await (const item of await opendir(directory)) {
          if (result.length >= maxEntries) {
            throw new PayloadTooLarge('Directory preview is limited to 1000 entries; download it instead.');
          }

          const { name } = item;
          if (!detailed) {
            result.push(name);
            continue;
          }

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
        if (activeBackups.has(Path.join(tempPath, item))) continue;
        const createdAt = Number(item.split('-')[0]);

        if (!Number.isInteger(createdAt) || now - createdAt >= TEMP_LIFETIME) {
          await File.delete(Path.join(tempPath, item));
        }
      }
    } catch (err) {
      logger.error({ err }, 'Error to remove old temp paths');
    }
  }

  static async makeZip(outputPath, paths, instancePath, maxBytes = null) {
    let handle;
    try {
      let output;
      if (maxBytes === null) {
        output = createWriteStream(outputPath);
      } else {
        handle = await open(outputPath, 'wx');
        let written = 0;
        const write = async (chunk) => {
          if (written + chunk.length > maxBytes) {
            throw new PayloadTooLarge('Backup exceeds the local ZIP limit.');
          }
          const free = await statfs(Path.dirname(outputPath));
          const allocated = Math.ceil(chunk.length / free.bsize) * free.bsize;
          if (allocated + config.files.minFreeBytes > free.bavail * free.bsize) {
            throw new InsufficientStorage('Insufficient temporary disk space for backup.');
          }
          // Await each disk write before checking the next block. No unchecked
          // bytes may queue behind the free-space check in another write stream.
          await handle.writeFile(chunk);
          written += chunk.length;
        };
        output = new Writable({
          write(chunk, encoding, callback) { write(chunk).then(() => callback(), callback); },
        });
      }
      await File.streamZip(output, paths, instancePath);
      return outputPath;
    } catch (err) {
      await rm(outputPath, { force: true });
      throw err;
    } finally {
      if (handle) await handle.close();
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
    const root = Path.resolve(instancePath);
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

    const release = await acquireDiskWrite();
    // Pin before directory creation so maintenance cannot race the backup.
    const tempPath = Path.join(config.paths.temp, `${Date.now()}-${randomUUID()}`);
    activeBackups.add(tempPath);
    const backupPath = Path.join(tempPath, `backup-${Date.now()}-${randomUUID()}.zip`);

    try {
      await mkdir(config.paths.temp, { recursive: true });

      const free = await statfs(config.paths.temp);
      const available = free.bavail * free.bsize - config.files.minFreeBytes;
      if (available <= 0) {
        throw new InsufficientStorage('Insufficient temporary disk space for backup.');
      }

      const maxBytes = Math.min(config.backup.maxBytes, available);
      await mkdir(tempPath, { recursive: true });

      await File.makeZip(backupPath, paths, instancePath, maxBytes);
      await File.validateBackup(backupPath, instance.type);

      const { size } = await stat(backupPath);
      return { backupPath, backupSize: size / (1024 * 1024) };
    } catch (err) {
      await File.releaseBackup(backupPath);
      throw err;
    } finally {
      release();
    }
  }

  static async validateBackup(backupPath, game) {
    const archive = await unzipper.Open.file(backupPath);
    const required = {
      minecraft: (name) => name === 'world/level.dat',
      terraria: (name) => name.startsWith('Worlds/') && name.endsWith('.wld'),
      kerbal: (name) => name.startsWith('Universe/'),
      hytale: (name) => name.startsWith('universe/'),
    };
    let hasWorld = false;
    // Read every entry back: a valid directory alone does not prove the ZIP is readable.
    for (const entry of archive.files) {
      if (entry.type !== 'File') continue;
      let bytes = 0;
      for await (const chunk of entry.stream()) bytes += chunk.length;
      if (bytes !== entry.uncompressedSize) throw new Error(`Invalid backup entry: ${entry.path}`);
      if (bytes > 0 && required[game](entry.path)) hasWorld = true;
    }
    if (!hasWorld) throw new Error(`Backup has no non-empty world data for ${game}`);
  }

  static async releaseBackup(backupPath) {
    const tempPath = Path.dirname(backupPath);
    try {
      await File.delete(tempPath);
    } finally {
      activeBackups.delete(tempPath);
    }
  }
}

export default File;
