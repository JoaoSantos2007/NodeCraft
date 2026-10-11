import Instance from '../services/Instance.js';
import Limit from '../services/Limit.js';

const queues = new Map();
const MIB = 1024 * 1024;

async function withFileBudget(id, action) {
  const instance = await Instance.readFileBudget(id);
  const { ownerId } = instance;
  const previous = queues.get(ownerId) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => { release = resolve; });
  queues.set(ownerId, current);
  await previous;

  try {
    const latest = await Instance.readFileBudget(id);
    const { user, usage } = await Limit.readUsage(ownerId);

    const allowanceMB = Math.max(0, user.maxDisk - usage.disk + latest.diskUsage);
    const budgetBytes = Math.floor(allowanceMB * MIB);

    const response = await action(budgetBytes);
    const usageHeader = response.headers.get('x-instance-disk-bytes');
    const usedBytes = Number(usageHeader);

    if (usageHeader !== null && Number.isSafeInteger(usedBytes) && usedBytes >= 0) {
      await Instance.updateDiskUsage(id, Math.ceil(usedBytes / MIB));
    }

    return response;
  } finally {
    if (queues.get(ownerId) === current) queues.delete(ownerId);
    release();
  }
}

export default withFileBudget;
