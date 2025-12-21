import docker from '../../config/docker.js';
import { INSTANCES_PATH } from '../../config/settings.js';

class Container {
  static async create(instance) {
    // Select docker image
    const image = instance.type === 'bedrock' ? 'itzg/minecraft-bedrock-server' : 'itzg/minecraft-server';

    // Set container enviroment
    const enviroment = instance.type === 'java'
      ? [
        'EULA=TRUE',
        'TYPE=CUSTOM',
        'CUSTOM_SERVER=server.jar',
      ]
      : [];

    const container = await docker.createContainer({
      name: `Nodecraft_${instance.id}`,
      Image: image,
      Env: enviroment,

      HostConfig: {
        Binds: [`${INSTANCES_PATH}/${instance.id}:/data`],
        PortBindings: {
          '25565/tcp': [{ HostPort: String(instance.port) }],
        },
        Memory: 2048 * 1024 * 1024, // MB
        NanoCpus: 2 * 1e9,
        RestartPolicy: { Name: 'no' },

        // Secure
        // ReadonlyRootfs: true,
        // CapDrop: ['ALL'],
        SecurityOpt: ['no-new-privileges'],
      },
    });

    return container;
  }

  static async get(id) {
    try {
      const container = docker.getContainer(`Nodecraft_${id}`);
      await container.inspect();

      return container;
    } catch {
      return null;
    }
  }

  static async isRunning(id) {
    try {
      const container = await Container.get(id);
      const info = await container.inspect();

      return info.State.Running;
    } catch {
      return false;
    }
  }
}

export default Container;
