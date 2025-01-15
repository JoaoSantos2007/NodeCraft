/* eslint-disable no-new */
import { scheduleJob } from 'node-schedule';
import Instance from './Instance.js';
import Bedrock from './Bedrock.js';
import Java from './Java.js';
import Action from './Action.js';

class Initialization {
  static runInstances() {
    const instances = Instance.readAll();
    instances.forEach((instance) => {
      if (instance.run) {
        if (instance.type === 'bedrock') new Bedrock(instance);
        else if (instance.type === 'java') new Java(instance);
      }
    });
  }

  static scheduleUpdates() {
    scheduleJob('0 3 * * *', Action.updateVersionAll);
  }
}

export default Initialization;
