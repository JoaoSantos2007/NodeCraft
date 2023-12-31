import { BadRequest, InvalidRequest } from '../errors/index.js';
import instancesList from '../utils/instancesList.js';
import Instance from './Instance.js';
import BedrockScript from '../scripts/Bedrock.js';
import JavaScript from '../scripts/Java.js';
import BedrockService from './Bedrock.js';
import JavaService from './Java.js';

class Action {
  static async readStatus(id) {
    const status = Action.verifyInstanceInProgess(id);
    if (!status) throw new BadRequest('Instance is not in progress!');

    status.terminal = undefined;
    status.settings = undefined;
    return status;
  }

  static async runInstance(id) {
    const instance = await Instance.readOne(id);
    const { type } = instance;
    let newInstance = null;

    if (type === 'bedrock') newInstance = new BedrockScript(instance);
    else if (type === 'java') newInstance = new JavaScript(instance);
    else throw new Error();

    instancesList[id] = newInstance;
    return instance;
  }

  static verifyInstanceInProgess(id) {
    return instancesList[id];
  }

  static async updateInstance(id) {
    const instance = await Instance.readOne(id);

    if (instance.disableUpdate) throw new InvalidRequest('Updates are disabled for this instance!');

    const { type } = instance;
    let info = { version: instance.version, build: instance.build, updated: false };
    if (type === 'bedrock') info = await BedrockService.update(instance);
    else if (type === 'java') info = await JavaService.update(instance);

    return info;
  }

  // Revisar
  static async updateAllInstances() {
    const instances = await Instance.readAll();

    instances.forEach(async (instance) => {
      if (!instance.disableUpdate) {
        const { id } = instance;
        if (Action.verifyInstanceInProgess(id)) await Instance.stop(id);
        await Instance.updateVersion(instance.id);
      }
    });
  }

  static async stopInstance(id) {
    const instance = await Instance.readOne(id);
    if (!Action.verifyInstanceInProgess(id)) throw new BadRequest('Instance is not in progress!');

    instancesList[id].stop();
    instancesList[id] = null;
    return instance;
  }
}

export default Action;
