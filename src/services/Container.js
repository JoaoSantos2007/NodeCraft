import { PassThrough } from 'stream';
import docker from '../../config/docker.js';
import REGISTRY from '../../config/registry.js';
import config from '../../config/index.js';

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
    // Verify if container is not running
    const isRunning = await Container.verifyRunning(container);

    // Run container if it is not running
    if (!isRunning) await container.start();
  }

  static async listen(id, callback) {
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

    REGISTRY[id].stream = stream;

    stdout.on('data', (chunk) => Container.handleChunk(chunk, id, callback));
    stderr.on('data', (chunk) => Container.handleChunk(chunk, id, callback));
  }

  static async handleChunk(chunk, id, callback) {
    let data = chunk.toString('utf8');
    let buffer = REGISTRY[id]?.buffer;

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
  }

  static removeStream(id) {
    const stream = REGISTRY[id]?.stream;

    if (stream) {
      stream.removeAllListeners('data');
      stream.removeAllListeners('error');
      stream.removeAllListeners('end');

      // Fecha o stream
      if (typeof stream.destroy === 'function') {
        stream.destroy();
      }
    }
  }
}

export default Container;
