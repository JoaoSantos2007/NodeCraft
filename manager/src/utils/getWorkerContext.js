import InstanceService from '../services/Instance.js';
import WorkerService from '../services/Worker.js';
import { InvalidRequest } from '../errors/index.js';

const getWorkerContext = async (instanceId) => {
  const instance = await InstanceService.readOne(instanceId);

  if (!instance.workerId) throw new InvalidRequest('Instance is not assigned to a worker!');

  const worker = await WorkerService.readOneWithSecret(instance.workerId);

  return {
    instance,
    worker: { id: worker.id, url: worker.url, secret: worker.secret },
  };
};

export default getWorkerContext;
