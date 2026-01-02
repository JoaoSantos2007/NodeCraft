import {
  mkdirSync,
  rmSync,
  existsSync,
  writeFileSync,
} from 'fs';
import { Op } from 'sequelize';
import {
  INSTANCES_PATH, MIN_PORT, MAX_PORT, REGISTRY,
} from '../../config/settings.js';
import { Instance as Model, Link as LinkModel, User as UserModel } from '../models/index.js';
import { BadRequest, InvalidRequest } from '../errors/index.js';
import download from '../utils/download.js';
import getVersion from '../utils/getVersion.js';
import Container from './Container.js';
import { syncFloodgate, syncGeyser, syncProperties } from '../utils/syncSettings.js';
import query from '../../config/query.js';
import Link from './Link.js';

class Instance {
  static async create(data, userId) {
    // Pick up a server port
    const port = await Instance.selectPort();

    // Create instance in the Database
    const instance = await Model.create({
      owner: userId,
      port,
      ...data,
    });

    // Create instance path in the System
    mkdirSync(`${INSTANCES_PATH}/${instance.id}`);

    // Create docker container

    return instance;
  }

  static async readAll() {
    const instances = await Model.findAll({
      include: {
        model: LinkModel,
        as: 'players',
        include: {
          model: UserModel,
          as: 'user',
          required: false,
        },
      },
    });
    return instances;
  }

  static async personalRead(user) {
    if (user.admin) return Instance.readAll();

    const userInstances = await Model.findAll({
      where: {
        owner: user.id,
      },
    });

    const instancesId = await Link.readInstancesIdByUserLink(user.id);

    const linkInstances = await Model.findAll({
      where: {
        id: { [Op.in]: instancesId },
      },
    });

    const instances = [...userInstances, ...linkInstances];

    return instances;
  }

  static async readOne(id) {
    const instance = await Model.findByPk(id, {
      include: {
        model: LinkModel,
        as: 'players',
        include: {
          model: UserModel,
          as: 'user',
          required: false,
        },
      },
    });
    if (!instance) throw new BadRequest('Instance not found!');

    return instance;
  }

  static async update(id, data) {
    const instance = await Instance.readOne(id);
    await instance.update(data);

    return instance;
  }

  static async delete(id) {
    const instance = await Instance.readOne(id);
    await instance.destroy();
    rmSync(`${INSTANCES_PATH}/${id}`, { recursive: true });

    return instance;
  }

  static async getInfo(instance) {
    const info = {
      needInstanceUpdate: false,
      instanceVersion: '',
      instanceBuild: 0,
      instanceUrl: null,
      needGeyserUpdate: false,
      geyserVersion: '',
      geyserBuild: 0,
      geyserUrl: null,
      needFloodgateUpdate: false,
      floodgateVersion: '',
      floodgateBuild: 0,
      floodgateUrl: null,
    };

    // Get Java latest info
    const instanceInfo = await getVersion(instance.software);
    let geyserInfo;
    let floodgateInfo;

    // Get Geyser and Floodgate latest info
    if (instance.geyser === true) {
      geyserInfo = await getVersion('geyser');
      floodgateInfo = await getVersion('floodgate');
    }

    info.instanceVersion = instanceInfo?.version;
    info.instanceBuild = instanceInfo?.build;
    info.instanceUrl = instanceInfo?.url;

    info.geyserVersion = geyserInfo?.version;
    info.geyserBuild = geyserInfo?.build;
    info.geyserUrl = geyserInfo?.url;

    info.floodgateVersion = floodgateInfo?.version;
    info.floodgateBuild = floodgateInfo?.build;
    info.floodgateUrl = floodgateInfo?.url;

    // Verify if instance needs updates
    info.needInstanceUpdate = instance.version !== info.instanceVersion;
    if (!info.needInstanceUpdate && info.instanceBuild) {
      info.needInstanceUpdate = Number(instance.build) !== Number(info.instanceBuild);
    }
    if (!instance.installed) {
      info.needInstanceUpdate = true;
    }

    // Verify if geyser and floodgate needs updates
    if (instance.geyser) {
      info.needGeyserUpdate = instance.geyserVersion !== info.geyserVersion
      || Number(instance.geyserBuild) !== Number(info.geyserBuild);

      info.needFloodgateUpdate = instance.floodgateVersion !== info.floodgateVersion
      || Number(instance.floodgateBuild) !== Number(info.floodgateBuild);
    }

    return info;
  }

  static async install(instance, force = false) {
    // Get Info updates
    const info = await Instance.getInfo(instance);

    // Verify neededUpdates
    let neededUpdates = 0;
    if (info.needInstanceUpdate) neededUpdates += 1;
    if (info.needGeyserUpdate) neededUpdates += 1;
    if (info.needFloodgateUpdate) neededUpdates += 1;

    // Return if no one update is needed
    if (neededUpdates === 0 && !force) return { info, updating: false };

    // Define variables for download process
    const needRestart = instance.running; // Verify if the instance will need restart
    const instancePath = `${INSTANCES_PATH}/${instance.id}`;
    const pluginsPath = `${instancePath}/plugins`;
    let downloadsCompleted = 0;

    // Start the instance install process in the background
    if (info.needInstanceUpdate) {
      download(`${instancePath}/server.jar`, info.instanceUrl).then(async () => {
        // Stop and Wait Instance for update
        // await Instance.stopAndWait(instance.id);

        // Update instance data
        await Instance.update(instance.id, {
          version: info.instanceVersion,
          build: info.instanceBuild,
          installed: true,
        });

        // Restart instance if necessary
        downloadsCompleted += 1;
        if (neededUpdates === downloadsCompleted && needRestart) new Instance(instance);
      });
    }

    if (info.needGeyserUpdate) {
      if (!existsSync(pluginsPath)) mkdirSync(pluginsPath);

      // Start the geyser install process in the background
      download(`${pluginsPath}/Geyser.jar`, info.geyserUrl).then(async () => {
        // Stop and Wait Instance for update
        await Instance.stopAndWait(instance.id);

        // Update instance data
        await Instance.update(instance.id, {
          geyserVersion: info.geyserVersion,
          geyserBuild: info.geyserBuild,
        });

        // Restart instance if necessary
        downloadsCompleted += 1;
        if (neededUpdates === downloadsCompleted && needRestart) new Instance(instance);
      });
    }

    if (info.needFloodgateUpdate) {
      if (!existsSync(pluginsPath)) mkdirSync(pluginsPath);

      // Start the floodgate install process in the background
      download(`${pluginsPath}/Floodgate.jar`, info.floodgateUrl).then(async () => {
        // Stop and Wait Instance for update
        await Instance.stopAndWait(instance.id);

        // Update instance data
        await Instance.update(instance.id, {
          floodgateVersion: info.floodgateVersion,
          floodgateBuild: info.floodgateBuild,
        });

        // Restart instance if necessary
        downloadsCompleted += 1;
        if (neededUpdates === downloadsCompleted && needRestart) new Instance(instance);
      });
    }

    // Return the immediate response
    return { info, updating: true };
  }

  static async selectPort() {
    const instances = await Instance.readAll();
    const usedPorts = [];
    const availablePorts = [];

    // Find used ports
    instances.forEach((instance) => {
      const serverPort = instance.port;

      if (!usedPorts.includes(serverPort) && !!serverPort) usedPorts.push(serverPort);
    });

    // Find available ports
    for (let port = MIN_PORT; port <= MAX_PORT; port += 1) {
      if (!usedPorts.includes(port)) {
        availablePorts.push(port);
      }
    }

    // Abort if no port available
    if (availablePorts.length === 0) throw new Error('No port available!');

    // Pick a freedom port
    const randomIndex = Math.floor(Math.random() * availablePorts.length);
    const randomPort = availablePorts[randomIndex];

    return randomPort;
  }

  static setup(instance, path) {
    // Sync database with server.properties
    syncProperties(instance, path);

    // Wipe allowlist and privilegies
    writeFileSync(`${path}/permissions.json`, '[]', 'utf8');
    writeFileSync(`${path}/allowlist.json`, '[]', 'utf8');

    // Remove session.lock
    if (existsSync(`${path}/world/session.lock`)) rmSync(`${path}/world/session.lock`, { recursive: true });

    // Ensure geyser
    if (instance.geyser) {
      syncGeyser(instance, path);
      syncFloodgate(instance, path);
    }
  }

  static register(instance) {
    REGISTRY[instance.id] = {
      id: instance.id,
      alive: false,
      queryInterval: null,
      stream: null,
      state: {
        playersOnline: 0,
        adminsOnline: 0,
        lastPolicyAppliedAt: 0,
      },
      monitor: {
        running: false,
        pending: false,
        timer: null,
        lastRun: 0,
      },
      rcon: null,
    };
  }

  static async setStream(instance) {
    const container = await Container.get(instance.id);
    const since = Math.floor(Date.now() / 1000);

    REGISTRY[instance.id].stream = await container.logs({
      stdout: true,
      stderr: true,
      follow: true,
      since,
      timestamps: false,
    });

    // Set stdout listener
    REGISTRY[instance.id].stream.on('data', async (chunk) => {
      const output = chunk.toString();
      await Instance.updateHistory(instance, output);

      if (
        output.includes('joined the game')
        || output.includes('left the game')
      ) {
        Instance.scheduleMonitor(instance, 400);
      }

      // Review
      console.log(output);
    });
  }

  static async monitor(instance) {
    const registry = REGISTRY[instance.id];
    if (!registry?.monitor) return;

    const { monitor } = registry;
    monitor.lastRun = Date.now();

    try {
      const state = await query(instance);
      const players = instance.players ?? [];

      const onlineAdmins = 0;

      registry.state = {
        online: state.online,
        onlinePlayers: state.onlinePlayers,
        onlineAdmins,
        players,
      };
    } catch (err) {
      // console.error('[MONITOR]', instance, err);
    }
  }

  static async run(id, internal = false) {
    // Read instance
    const instance = await Instance.readOne(id);
    const path = `${INSTANCES_PATH}/${id}`;

    if (!internal && instance.running) throw new InvalidRequest('Instance is already running!');

    // Create container if not exists
    let container;
    container = await Container.get(id);
    if (!container) container = await Container.create(instance, path);

    // Verify if container is not running
    const isRunning = await Container.isRunning(id);

    if (!isRunning) {
      // Run container
      Instance.setup(instance, path); // Setup ambient to run instance
      await container.start();
    }

    // Registry instance
    Instance.register(instance);

    // Set stream stdout data
    await Instance.setStream(instance);

    // Run first monitor
    Instance.monitor(instance);

    // Set instance monitoring
    REGISTRY[instance.id].interval = setInterval(() => Instance.monitor(instance), 5000);

    await instance.update({ running: true });

    return instance;
  }

  static async stop(id) {
    const instance = await Instance.readOne(id);
    const container = await Container.get(id);

    const isRunning = await Container.isRunning(id);
    if (!isRunning) throw new InvalidRequest('Instance is not running!');

    try {
      await container.stop({ t: 20 }); // SIGTERM
    } catch {
      await container.kill(); // SIGKILL
    }

    await instance.update({ running: false });
    return instance;
  }

  static async updateHistory(instance, output) {
    let msg = output;
    let history = instance?.history;

    if (!msg.endsWith('\n')) msg += '\n';
    history += msg;

    // Verify and slice old lines
    const lines = history.split('\n');
    if (lines.length > instance.maxHistory) {
      const trimmedLines = lines.slice(lines.length - instance.maxHistory);
      history = trimmedLines.join('\n');
    }

    await instance.update({ history });
  }
}

export default Instance;
