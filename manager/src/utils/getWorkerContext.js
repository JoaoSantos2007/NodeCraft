import InstanceService from '../services/Instance.js';
import WorkerService from '../services/Worker.js';

const getWorkerContext = async (instanceId) => {
  const instance = await InstanceService.readOne(instanceId);

  const worker = await WorkerService.readOneWithSecret(instance.workerId);

  return { instance, worker };
};

export default getWorkerContext;
