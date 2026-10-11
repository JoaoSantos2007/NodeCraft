import Path from 'node:path';
import { statfs } from 'node:fs/promises';
import config from '../../config/config.js';
import { InvalidRequest, PayloadTooLarge, InsufficientStorage } from '../errors/index.js';
import { visitInstanceFiles } from '../utils/verifyPaths.js';
import { diskBytes } from '../utils/diskUsage.js';

const queues = new Map();

async function treeBytes(path, relative = '') {
  let bytes = 0;

  await visitInstanceFiles(path, relative, async ({ stats }) => {
    bytes += diskBytes(stats);
  });

  return bytes;
}

async function checkGrowth(req, additionalBytes) {
  if (!Number.isSafeInteger(additionalBytes) || additionalBytes < 0) {
    throw new InvalidRequest('Invalid file size!');
  }

  if (additionalBytes > req.diskBudget.remainingBytes) {
    throw new PayloadTooLarge('The operation exceeds the owner disk quota!');
  }

  const free = await statfs(req.diskBudget.root);
  if (additionalBytes + config.files.minFreeBytes > free.bavail * free.bsize) {
    throw new InsufficientStorage('The worker has insufficient free disk space!');
  }
}

const diskBudget = async (req, res, next) => {
  // All instances on this worker share a volume. Serialize API writes so
  // concurrent requests cannot each spend the same free-space allowance.
  const key = 'shared-volume';
  const previous = queues.get(key) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => { release = resolve; });
  queues.set(key, current);
  await previous;

  const unlock = () => {
    if (queues.get(key) === current) queues.delete(key);
    release();
  };

  res.once('finish', unlock);
  res.once('close', unlock);

  try {
    const total = Number(req.headers['x-disk-budget-bytes']);

    if (!Number.isSafeInteger(total) || total < 0) {
      throw new InvalidRequest('Missing disk budget!');
    }

    const root = Path.join(config.paths.instances, req.params.id);
    const used = await treeBytes(root);

    req.diskBudget = {
      root,
      remainingBytes: Math.max(0, total - used),
      check: (bytes) => checkGrowth(req, bytes),
    };

    next();
  } catch (err) {
    next(err);
  }
};

export { treeBytes };
export default diskBudget;
