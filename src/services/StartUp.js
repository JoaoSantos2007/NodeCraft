/* eslint-disable no-new */
import { scheduleJob } from 'node-schedule';
import Instance from './Instance.js';

class StartUp {
  static async restartInstances() {
    const instances = await Instance.readAll();

    instances.forEach(async (instance) => {
      if (instance.running) await Instance.run(instance.id);
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

export default StartUp;
