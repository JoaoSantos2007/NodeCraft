import { PassThrough } from 'stream';
import docker from '../../config/docker.js';
import instancesRunning from '../runtime/instancesRunning.js';
import config from '../../config/index.js';
import InstanceModel from '../models/Instance.js';
import logger from '../../config/logger.js';

class Container {
  static ensureImage(imageName) {
    return new Promise((resolve, reject) => {
      docker.getImage(imageName).inspect()
        .then(() => resolve())
        .catch(() => {
          docker.pull(imageName, (err, stream) => {
            if (err) return reject(err);

            return docker.modem.followProgress(
              stream,
              (errProgress) => (errProgress ? reject(errProgress) : resolve()),
            );
          });
        });
    });
  }

  static async ensureNetwork(networkName) {
    const networks = await docker.listNetworks();

    let exists = false;
    networks.forEach((net) => {
      if (net.Name === networkName) exists = true;
    });

    if (exists) return;

    await docker.createNetwork({
      Name: networkName,
      Driver: 'bridge',
      Internal: false,
      Attachable: false,
    });
  }

  static async create(instance) {
    await Container.ensureImage('itzg/minecraft-server');
    await Container.ensureNetwork('nodecraft-net');

    const container = await docker.createContainer({
      name: `Nodecraft_${instance.id}`,
      Image: 'itzg/minecraft-server',
      Env: [
        'EULA=TRUE',
        'TYPE=CUSTOM',
        'CUSTOM_SERVER=server.jar',

        // Rcon
        'ENABLE_RCON=true',
        'RCON_PASSWORD=nodecraft',
        'RCON_PORT=25575',
      ],

      HostConfig: {
        Binds: [`${config.instance.path}/${instance.id}:/data`],
        PortBindings: {
          '25565/tcp': [
            { HostPort: String(instance.port) },
          ],
          '25565/udp': [
            { HostPort: String(instance.port) },
          ],
        },

        NetworkMode: 'nodecraft-net',

        Memory: 2048 * 1024 * 1024, // MB
        NanoCpus: 2 * 1e9,

        // Secure
        // ReadonlyRootfs: true,
        // CapDrop: ['ALL'],
        RestartPolicy: { Name: 'no' },
        SecurityOpt: ['no-new-privileges'],
      },
    });

    return container;
  }

  static async delete(id) {
    try {
      const container = await Container.get(id);
      if (!container) return;

      await container.remove({ force: true });
    } catch (err) {
      logger.error({ err }, 'Error to delete docker container');
    }
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

  static async getOrCreate(instance) {
    // Read container
    let container = await Container.get(instance.id);

    // Create container if not exists
    if (!container) container = await Container.create(instance);

    return container;
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

  static async verifyRunning(container) {
    try {
      const info = await container.inspect();

      return info.State.Running;
    } catch {
      return false;
    }
  }

  static async getIpAddress(id) {
    try {
      const container = docker.getContainer(`Nodecraft_${id}`);
      const inspect = await container.inspect();
      const network = inspect.NetworkSettings.Networks['nodecraft-net'];

      return network.IPAddress;
    } catch {
      return '';
    }
  }

  static async run(container) {
    try {
      // Verify if container is not running
      const isRunning = await Container.verifyRunning(container);

      // Run container if it is not running
      if (!isRunning) await container.start();
    } catch (err) {
      logger.error({ err }, 'Error to start container');
    }
  }

  static async listen(id, callback) {
    try {
      const container = await Container.get(id);
      const since = Math.floor(Date.now() / 1000);

      const stream = await container.logs({
        stdout: true,
        stderr: true,
        follow: true,
        since,
        timestamps: false,
      });

      const stdout = new PassThrough();
      const stderr = new PassThrough();

      container.modem.demuxStream(stream, stdout, stderr);

      instancesRunning[id].stream = stream;

      stdout.on('data', (chunk) => Container.handleChunk(chunk, id, callback));
      stderr.on('data', (chunk) => Container.handleChunk(chunk, id, callback));
    } catch (err) {
      logger.error({ err }, 'Error to listen container');
    }
  }

  static async handleChunk(chunk, id, callback) {
    try {
      let data = chunk.toString('utf8');
      let buffer = instancesRunning[id]?.buffer;

      // eslint-disable-next-line no-control-regex
      data = data.replace(/\x1B\[[0-9;]*m/g, ''); // ANSI
      data = data.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

      buffer += data;

      const lines = buffer.split('\n');
      buffer = lines.pop();

      lines.forEach((line) => {
        const cleanLine = line.trim();
        if (!cleanLine) return;

        const match = cleanLine.match(
          /^\[(\d{2}:\d{2}:\d{2})\s+(INFO|WARN|ERROR|DEBUG|TRACE)\]:\s*(.*)$/,
        );

        const message = match ? match[3] : cleanLine;

        callback(message);
      });
    } catch (err) {
      logger.error({ err }, 'Error to handle container stream chunck');
    }
  }

  static removeStream(id) {
    try {
      const stream = instancesRunning[id]?.stream;

      if (stream) {
        stream.removeAllListeners('data');
        stream.removeAllListeners('error');
        stream.removeAllListeners('end');

        // Fecha o stream
        if (typeof stream.destroy === 'function') {
          stream.destroy();
        }
      }
    } catch (err) {
      logger.error({ err }, 'Error to remove container stream');
    }
  }

  static async removeLostContainers() {
    try {
      const instances = await InstanceModel.findAll({
        attributes: ['id'],
        raw: true,
      }) || [];
      const instancesId = [];
      for (const instance of instances) {
        instancesId.push(instance.id);
      }

      const containers = await docker.listContainers({ all: true });
      for (const container of containers) {
        const name = container.Names?.[0];
        if (!name) continue;

        const cleanName = name.replace(/^\//, '');
        if (!cleanName.startsWith('Nodecraft_')) continue;

        const instanceId = cleanName.replace('Nodecraft_', '');
        if (!instancesId.includes(instanceId)) {
          await Container.delete(instanceId);
        }
      }
    } catch (err) {
      logger.error({ err }, 'Error to remove lost containers');
    }
  }
}

export default Container;
