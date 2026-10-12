import Path from 'path';
import { randomBytes } from 'node:crypto';
import docker from '../../config/docker.js';
import logger from '../../config/logger.js';
import { Internal } from '../errors/index.js';
import config from '../../config/config.js';

const dockerImages = config.images;

class Container {
  static async fetchLatestMinecraftVersion() {
    const res = await fetch('https://launchermeta.mojang.com/mc/game/version_manifest_v2.json');
    if (!res.ok) throw new Error(`Failed to fetch Minecraft version manifest: ${res.status}`);
    const manifest = await res.json();
    return manifest.latest.release;
  }

  static async defineMinecraft(instance, path, rconPassword) {
    const gameData = instance?.minecraft;
    if (!gameData) throw new Error('instance has no minecraft config!');

    const version = await Container.fetchLatestMinecraftVersion();

    const enviroment = [
      'EULA=TRUE',
      'ENABLE_RCON=true',
      `RCON_PASSWORD=${rconPassword}`,
      'RCON_PORT=25575',
      `UID=${config.system.puid}`,
      `GID=${config.system.pgid}`,
      `VERSION=${version}`,
      `MAX_MEMORY=${instance.memory}M`,
    ];
    if (gameData.software === 'paper') {
      enviroment.push('TYPE=paper');
      enviroment.push('PAPER_CHANNEL=experimental');

      if (gameData.bedrock === true) {
        enviroment.push(
          [
            'PLUGINS=https://download.geysermc.org/v2/projects/geyser/versions/latest/builds/latest/downloads/spigot',
            'https://download.geysermc.org/v2/projects/floodgate/versions/latest/builds/latest/downloads/spigot',
          ].join('\n'),
        );
      }
    } else if (gameData.software === 'purpur') {
      enviroment.push('TYPE=purpur');

      if (gameData.bedrock === true) {
        enviroment.push(
          [
            'PLUGINS=https://download.geysermc.org/v2/projects/geyser/versions/latest/builds/latest/downloads/spigot',
            'https://download.geysermc.org/v2/projects/floodgate/versions/latest/builds/latest/downloads/spigot',
          ].join('\n'),
        );
      }
    }

    const image = dockerImages.minecraft;
    const binds = [`${path}:/data`];
    const portBindings = {
      '25565/tcp': [
        { HostPort: String(instance.port) },
      ],
      '25565/udp': [
        { HostPort: String(instance.port) },
      ],
    };

    return {
      enviroment,
      binds,
      image,
      portBindings,
    };
  }

  static defineKerbal(instance, path) {
    const image = dockerImages.kerbal;
    const enviroment = [
      `PUID=${config.system.puid}`,
      `PGID=${config.system.pgid}`,
    ];
    const exposedPorts = { '6702/tcp': {} };
    const binds = [
      `${path}/Config:/data/Config`,
      `${path}/Universe:/data/Universe`,
      `${path}/logs:/data/logs`,
    ];
    const portBindings = {
      '6702/tcp': [
        { HostPort: String(instance.port) },
      ],
    };

    return {
      binds,
      image,
      portBindings,
      exposedPorts,
      enviroment,
    };
  }

  static defineHytale(instance, path) {
    const gameData = instance?.hytale;
    if (!gameData) throw new Error('instance has no hytale config!');

    const image = dockerImages.hytale;
    const enviroment = [
      `PUID=${config.system.puid}`,
      `PGID=${config.system.pgid}`,
      `MAX_PLAYERS=${instance.maxPlayers}`,
      `MAX_MEMORY=${instance.memory}M`,
      `VIEW_DISTANCE=${gameData.maxView}`,
      'DEFAULT_PORT=5520',
      'AUTH_MODE=authenticated',
      'ENABLE_BACKUPS=false',
    ];
    const exposedPorts = { '5520/udp': {} };
    const binds = [`${path}:/home/hytale/server-files`];
    const portBindings = {
      '5520/udp': [
        { HostPort: String(instance.port) },
      ],
    };

    return {
      binds,
      image,
      portBindings,
      exposedPorts,
      enviroment,
    };
  }

  static defineTerraria(instance, path) {
    const image = dockerImages.terraria;
    const enviroment = [
      `PUID=${config.system.puid}`,
      `PGID=${config.system.pgid}`,
      'SERVERCONFIG=1',
    ];
    const exposedPorts = { '7777/tcp': {} };
    const binds = [
      `${path}:/opt/terraria/config/`,
    ];
    const portBindings = {
      '7777/tcp': [
        { HostPort: String(instance.port) },
      ],
    };

    return {
      binds,
      image,
      enviroment,
      portBindings,
      exposedPorts,
    };
  }

  static async create(instance) {
    const existsContainer = await Container.get(instance.id);
    if (existsContainer) {
      const details = await existsContainer.inspect();
      const password = details.Config?.Env?.find((value) => value.startsWith('RCON_PASSWORD='))
        ?.slice('RCON_PASSWORD='.length);

      const validPassword = instance.type !== 'minecraft' || /^[0-9a-f]{64}$/.test(password || '');
      // Adopt auto-removal on the next startup without interrupting running servers.
      const reusable = details.State.Running
        || (instance.type !== 'hytale' && details.HostConfig?.AutoRemove);
      if (validPassword && reusable) {
        return { container: existsContainer, rconPassword: password };
      }

      await existsContainer.remove({ force: true });
    }

    const instancePath = Path.join(config.paths.instances, instance.id);
    let info = null;
    let rconPassword;

    switch (instance.type) {
      case 'minecraft':
        rconPassword = randomBytes(32).toString('hex');
        info = await Container.defineMinecraft(instance, instancePath, rconPassword);
        break;
      case 'kerbal':
        info = Container.defineKerbal(instance, instancePath);
        break;
      case 'hytale':
        info = Container.defineHytale(instance, instancePath);
        break;
      case 'terraria':
        info = Container.defineTerraria(instance, instancePath);
        break;
      default:
        throw new Internal('No container game type available!');
    }

    const container = await docker.createContainer({
      name: `Nodecraft_${instance.id}`,
      Image: info.image,
      Env: info.enviroment,

      Tty: true,
      OpenStdin: true,
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      StopTimeout: instance.type === 'hytale' ? 30 : 20,

      ExposedPorts: info.exposedPorts,

      HostConfig: {
        AutoRemove: true,
        Binds: info.binds,
        PortBindings: info.portBindings,

        NetworkMode: 'nodecraft-net',
        Memory: Math.ceil(instance.memory * 1.3) * 1024 * 1024,
        NanoCpus: instance.cpu * 1e9,

        // Secure
        // ReadonlyRootfs: true,
        // CapDrop: ['ALL'],
        RestartPolicy: { Name: 'no' },
        SecurityOpt: ['no-new-privileges'],
      },
    });

    return { container, rconPassword };
  }

  static async get(id, strict = false) {
    try {
      const container = docker.getContainer(`Nodecraft_${id}`);
      const details = await container.inspect();

      // Keep operations tied to this container, even if its name is reused after exit.
      return docker.getContainer(details.Id);
    } catch (err) {
      if (strict && err.statusCode !== 404) throw err;
      return null;
    }
  }

  static async getIpAddress(id) {
    try {
      const container = await Container.get(id);
      const inspect = await container.inspect();
      const network = inspect.NetworkSettings.Networks['nodecraft-net'];

      return network.IPAddress;
    } catch {
      return '';
    }
  }

  static async delete(id) {
    try {
      const container = await Container.get(id);
      if (!container) return;

      await container.remove({ force: true });
    } catch (err) {
      if (err.statusCode === 404) return; // Docker may already have auto-removed it.
      logger.error({ err }, 'Error to delete docker container');
    }
  }

  static async run(id) {
    try {
      // Read container
      const container = await Container.get(id);
      if (!container) return;

      // Get container info
      const info = await container.inspect();
      const isRunning = info.State.Running;

      if (!isRunning) await container.start();
    } catch (err) {
      logger.error({ err }, 'Error to start container');
    }
  }

  static async stop(id, strict = false) {
    let waitController;

    try {
      // Read container
      const container = await Container.get(id, strict);
      if (!container) return;

      // Get container info
      const info = await container.inspect();
      const isRunning = info.State.Running;

      let exitResult;
      if (isRunning && info.HostConfig?.AutoRemove) {
        // Subscribe before stopping: inspect cannot read the exit code after auto-removal.
        waitController = new AbortController();
        exitResult = container.wait({ condition: 'removed', abortSignal: waitController.signal })
          .then((result) => ({ result }), (error) => ({ error }));
      }

      // Stop container
      if (isRunning) {
        try {
          await container.stop({ t: info.Config?.StopTimeout ?? 20 }); // SIGTERM
        } catch (err) {
          if (strict) throw err;
          await container.kill(); // SIGKILL
        }
      }
      if (exitResult) {
        const { result, error } = await exitResult;

        if (error) throw error;
        const failed = !Number.isInteger(result?.StatusCode)
          || result.StatusCode === 137 || result.Error?.Message;

        if (strict && failed) {
          throw new Error('Container did not stop cleanly; backup aborted');
        }
      } else if (strict) {
        const stopped = await container.inspect();

        if (stopped.State.Running || stopped.State.Restarting || stopped.State.ExitCode === 137) {
          throw new Error('Container did not stop cleanly; backup aborted');
        }
      }
    } catch (err) {
      logger.error({ err }, 'Error to stop container');
      if (strict) throw err;
    } finally {
      waitController?.abort();
    }
  }

  static async removeLost(instances) {
    try {
      if (!Array.isArray(instances)) {
        logger.error('Refusing to remove lost containers without a valid instance list');

        return;
      }

      const containers = await docker.listContainers({ all: true });

      for (const container of containers) {
        const name = container.Names?.[0];
        if (!name) continue;

        const cleanName = name.replace(/^\//, '');
        if (!cleanName.startsWith('Nodecraft_')) continue;

        const id = cleanName.replace('Nodecraft_', '');

        let instanceExists = false;
        for (const instance of instances) {
          if (instance.id === id) instanceExists = true;
        }

        if (!instanceExists) await Container.delete(id);
      }
    } catch (err) {
      logger.error({ err }, 'Error to remove lost containers');
    }
  }

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
}

export default Container;
