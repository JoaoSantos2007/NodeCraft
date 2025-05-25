/* eslint-disable no-new */
import { scheduleJob } from 'node-schedule';
import Instance from './Instance.js';

class Initialization {
  static async runInstances() {
    const instances = await Instance.readAll();
    instances.forEach((instance) => {
      if (instance.running) new Instance(instance);
    });
  }

  static scheduleUpdates() {
    // Update all instances
    scheduleJob('0 3 * * *', async () => {
      const instances = await Instance.readAll();

      instances.forEach(async (instance) => {
        if (!instance.updateAlways) return;
        await Instance.install();
      });
    });
  }
}

export default Initialization;
