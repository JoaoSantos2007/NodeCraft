/* eslint-disable no-new */
import { scheduleJob } from 'node-schedule';
import Instance from './Instance.js';

class StartUp {
  static async restartInstances() {
    const instances = await Instance.readAll();
    instances.forEach(async (instance) => {
      const pid = instance?.pid;

      if (instance.running || pid) {
        if (pid) await Instance.stopAndWait(instance.id);
        if (instance.running) new Instance(instance);
      }
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
