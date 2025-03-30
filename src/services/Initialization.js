/* eslint-disable no-new */
import { scheduleJob } from 'node-schedule';
import Instance from './Instance.js';
import Bedrock from './Bedrock.js';
import Java from './Java.js';

class Initialization {
  static async runInstances() {
    const instances = await Instance.readAll();
    instances.forEach((instance) => {
      if (instance.run) {
        if (instance.type === 'bedrock') new Bedrock(instance);
        else if (instance.type === 'java') new Java(instance);
      }
    });
  }

  static scheduleUpdates() {
    // Update all instances
    scheduleJob('0 3 * * *', async () => {
      const instances = await Instance.readAll();

      instances.forEach(async (instance) => {
        if (!instance.updateAlways) return;
        const { type } = instance;

        if (type === 'bedrock') await Bedrock.install(instance);
        else if (type === 'java') await Java.install(instance);
      });
    });
  }
}

export default Initialization;
