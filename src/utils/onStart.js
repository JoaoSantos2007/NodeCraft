import { scheduleJob } from 'node-schedule';
import Instance from '../services/Instance.js';

const restartInstances = async () => {
  const instances = await Instance.readAll();

  instances.forEach(async (instance) => {
    if (instance.running) await Instance.run(instance.id, true);
  });
};

const scheduleUpdates = () => {
  // Update all instances
  scheduleJob('0 3 * * *', async () => {
    const instances = await Instance.readAll();

    instances.forEach(async (instance) => {
      if (!instance.updateAlways) return;
      await Instance.install();
    });
  });
};

export { restartInstances, scheduleUpdates };
