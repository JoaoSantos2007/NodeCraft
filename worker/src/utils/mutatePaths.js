import Path from 'path';
import {
  open, readdir, unlink, rmdir, mkdir,
} from 'node:fs/promises';
import { constants } from 'node:fs';

// Resolve each directory through the previous descriptor. O_NOFOLLOW applies
// to every component, including ancestors of the instance, not only the leaf.
const openDirectory = async (path, create = false) => {
  const absolute = Path.resolve(path);
  // Only paths produced by this module use this prefix; API paths are joined
  // to the instance root before reaching here.
  const descriptor = absolute.match(/^\/proc\/self\/fd\/\d+(?=\/|$)/)?.[0];
  const root = descriptor || Path.parse(absolute).root;
  // eslint-disable-next-line no-bitwise
  const flags = constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW;
  // /proc/self/fd is the one intentional link: it refers to our open directory.
  // eslint-disable-next-line no-bitwise
  let handle = await open(root, constants.O_RDONLY | constants.O_DIRECTORY);

  try {
    for (const part of absolute.slice(root.length).split(Path.sep).filter(Boolean)) {
      const target = `/proc/self/fd/${handle.fd}/${part}`;
      let child;
      try {
        child = await open(target, flags);
      } catch (err) {
        if (!create || err.code !== 'ENOENT') throw err;
        try {
          await mkdir(target);
        } catch (mkdirError) {
          if (mkdirError.code !== 'EEXIST') throw mkdirError;
        }
        // Reopen with O_NOFOLLOW even if another process created the entry.
        child = await open(target, flags);
      }
      await handle.close();
      handle = child;
    }
    return handle;
  } catch (err) {
    await handle.close();
    throw err;
  }
};

// Keep the parent alive until all I/O (including streams and cleanup) finishes.
const withPathParent = async (path, operation) => {
  const parent = await openDirectory(Path.dirname(path));
  try {
    return await operation(`/proc/self/fd/${parent.fd}/${Path.basename(path)}`);
  } finally {
    await parent.close();
  }
};

// Never pass a mutable directory tree to recursive rm: pin every directory
// before visiting its children, and unlink links without following them.
const removePath = async (path, force = false) => withPathParent(path, async (target) => {
  let directory;
  try {
    try {
      directory = await openDirectory(target);
    } catch (err) {
      if (err.code !== 'ENOTDIR' && err.code !== 'ELOOP') throw err;
      await unlink(target);
      return;
    }

    for (const name of await readdir(`/proc/self/fd/${directory.fd}`)) {
      await removePath(`/proc/self/fd/${directory.fd}/${name}`, force);
    }
    await rmdir(target);
  } catch (err) {
    if (!force || err.code !== 'ENOENT') throw err;
  } finally {
    if (directory) await directory.close();
  }
});

export { openDirectory, withPathParent, removePath };
