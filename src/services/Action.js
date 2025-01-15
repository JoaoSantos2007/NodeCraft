/* eslint-disable no-new */
import { InvalidRequest } from '../errors/index.js';
import { INSTANCES } from '../../config/settings.js';
import Instance from './Instance.js';
import Java from './Java.js';
import Bedrock from './Bedrock.js';
import NodeCraft from './NodeCraft.js';

class Action {
  static readStatus(id) {
    const instance = Instance.verifyInProgess(id);
    if (!instance) throw new InvalidRequest('Instance is not in progress!');

    const status = { ...instance };

    status.terminal = undefined;
    status.settings = undefined;
    return status;
  }

  static run(id) {
    const instance = Instance.readOne(id);
    const { type } = instance;

    if (type === 'bedrock') new Bedrock(instance);
    else if (type === 'java') new Java(instance);

    instance.run = true;
    NodeCraft.update(id, instance);

    return instance;
  }

  static async updateVersion(id, force = false) {
    const instance = Instance.readOne(id);

    if (instance.disableUpdate) throw new InvalidRequest('Updates are disabled for this instance!');

    const { type } = instance;
    let info = { version: instance.version, build: instance.build, updated: false };
    if (type === 'bedrock') info = await Bedrock.install(instance, force);
    else if (type === 'java') info = await Java.install(instance, force);

    return info;
  }

  static updateVersionAll() {
    const instances = Instance.readAll();

    instances.forEach(async (instance) => {
      if (instance.disableUpdate) return;
      await Action.updateVersion(instance.id);
    });
  }

  static stop(id) {
    const instance = Instance.readOne(id);
    if (!Instance.verifyInProgess(id)) throw new InvalidRequest('Instance is not in progress!');

    INSTANCES[id].stop();

    instance.run = false;
    NodeCraft.update(id, instance);

    return instance;
  }
}

export default Action;
