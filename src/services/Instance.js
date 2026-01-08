import {
  mkdirSync,
  rmSync,
  existsSync,
  writeFileSync,
  readFileSync,
  readdirSync,
} from 'fs';
import { Op } from 'sequelize';
import {
  INSTANCES_PATH, MIN_PORT, MAX_PORT, REGISTRY,
  INSTANCE_MAX_AGE,
} from '../../config/settings.js';
import { Instance as Model, Link as LinkModel, User as UserModel } from '../models/index.js';
import { BadRequest } from '../errors/index.js';
import download from '../utils/download.js';
import { getInfo } from '../utils/getVersion.js';
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
    await Container.create(instance);

    // Install instance
    Instance.install(instance, true);

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

  static async updateAll() {
    const instances = await Instance.readAll();

    instances.forEach(async (instance) => {
      if (!instance.updateAlways) return;
      await Instance.install(instance);
    });
  }

  static async delete(id) {
    const instance = await Instance.readOne(id);
    await instance.destroy();
    rmSync(`${INSTANCES_PATH}/${id}`, { recursive: true, force: true });

    return instance;
  }

  static async install(instance, force = false) {
    // Get Info updates and verify if need updates
    const info = await getInfo(instance);
    if (info.neededUpdates === 0 && !force) return { info, updating: false };

    // Define variables for download process
    const needRestart = instance.running; // Verify if the instance will need restart
    const instancePath = `${INSTANCES_PATH}/${instance.id}`;
    const pluginsPath = `${instancePath}/plugins`;
    let downloadsCompleted = 0;

    // Create plugins path if not exists
    if (!existsSync(pluginsPath)) mkdirSync(pluginsPath);

    // Stop instance and wait
    await Instance.stop(instance.id);

    const endDownloading = () => {
      downloadsCompleted += 1;

      // Downloads completed
      if (info.neededUpdates === downloadsCompleted) {
        Instance.update(instance.id, {
          installed: true,
          version: info.instanceVersion,
          build: info.instanceBuild,
          geyserBuild: info.geyserBuild,
          floodgateBuild: info.floodgateBuild,
        });

        if (needRestart) Instance.run(instance.id);
      }
    };

    // Start the instance install process in the background
    if (info.needInstanceUpdate) download(`${instancePath}/server.jar`, info.instanceUrl).then(endDownloading);
    if (info.needGeyserUpdate) download(`${pluginsPath}/Geyser.jar`, info.geyserUrl).then(endDownloading);
    if (info.needFloodgateUpdate) download(`${pluginsPath}/Floodgate.jar`, info.floodgateUrl).then(endDownloading);

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

  static async run(id) {
    // Read instance
    const instance = await Instance.readOne(id);
    const path = `${INSTANCES_PATH}/${id}`;

    // Read container or create one
    const container = await Container.getOrCreate(instance);

    // Setup ambient to run instance
    Instance.setup(instance, path);

    // Run container if it is not running
    await Container.run(container);

    // Registry instance
    Instance.register(instance);

    // Set container listen
    Instance.setListening(id);

    // Set instance monitoring
    Instance.setMonitoring(id);

    // Update instance running status
    await instance.update({ running: true });

    return instance;
  }

  static async stop(id) {
    const instance = await Instance.readOne(id);
    const container = await Container.get(id);

    const isRunning = await Container.isRunning(id);

    if (isRunning) {
      try {
        await container.stop({ t: 20 }); // SIGTERM
      } catch {
        await container.kill(); // SIGKILL
      }
    }

    // Clean intervals and wipe registry
    if (REGISTRY[id]) {
      clearInterval(REGISTRY[id].interval);
      Container.removeStream(id);
      delete REGISTRY[id];
    }

    // Update running instance status
    await instance.update({ running: false });

    return instance;
  }

  static async attachAll() {
    const instances = await Instance.readAll();

    instances.forEach(async (instance) => {
      if (instance.running) await Instance.run(instance.id);
    });
  }

  static async verifyLost() {
    const instancesId = readdirSync(INSTANCES_PATH);
    if (!instancesId) return;

    instancesId.forEach(async (id) => {
      const pendingDeletePath = `${INSTANCES_PATH}/${id}/.delete-pending.json`;
      const existsPendingDelete = existsSync(pendingDeletePath);

      try {
        const instance = await Model.findByPk(id);

        // Verify if instances exists in database, delete pending process and return
        if (instance) {
          rmSync(pendingDeletePath, { recursive: true, force: true });
          return;
        }
      } catch (err) {
        return;
      }

      // Verify if pending delete process exists
      if (existsPendingDelete) {
        // Try to read .delete-pending.json
        const rawData = readFileSync(`${INSTANCES_PATH}/${id}/.delete-pending.json`, 'utf8');
        const data = JSON.parse(rawData);

        const time = Number(data?.time);
        const now = Date.now();

        if (!time || now - time >= INSTANCE_MAX_AGE) {
          // Delete pending instance
          rmSync(`${INSTANCES_PATH}/${id}`, { recursive: true, force: true });
        }
      } else {
        // Write .delete-pending.json
        writeFileSync(pendingDeletePath, `{"time":${Date.now()}}`, 'utf8');
      }
    });
  }

  static setup(instance, path) {
    // Sync database with server.properties
    syncProperties(instance, path);

    // Wipe allowlist and privilegies
    writeFileSync(`${path}/whitelist.json`, '[]', 'utf8');
    writeFileSync(`${path}/ops.json`, '[]', 'utf8');

    // Remove session.lock
    if (existsSync(`${path}/world/session.lock`)) rmSync(`${path}/world/session.lock`, { recursive: true });

    // Ensure bedrock
    if (instance.bedrock) {
      syncGeyser(instance, path);
      syncFloodgate(instance, path);
    }
  }

  static register(instance) {
    REGISTRY[instance.id] = {
      id: instance.id,
      state: {
        alive: false,
        playersOnline: 0,
        adminsOnline: 0,
        lastPolicyAppliedAt: 0,
      },
      lastMonitoringRun: 0,
      instance,
      stream: null,
      interval: null,
      rcon: null,
      buffer: '',
    };
  }

  static setListening(id) {
    Container.listen(id, async (msg) => {
      Instance.updateHistory(id, msg);

      if (msg.includes('joined the game') || msg.includes('left the game')) {
        Instance.monitor(id);
      }
    });
  }

  static setMonitoring(id) {
    // First monitor
    Instance.monitor(id);

    // Set instance monitoring
    REGISTRY[id].interval = setInterval(() => Instance.monitor(id), 5000);
  }

  static async monitor(id) {
    const registry = REGISTRY[id];
    const instance = registry?.instance;
    if (!instance) return;

    // Verify last run
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

  static async updateHistory(id, message) {
    // Get instance in registry
    const instance = REGISTRY[id]?.instance;
    if (!instance) return;

    // Copy instance history array
    let history = [...instance.history];
    history.push(message);

    // Wipe old lines
    const historyLength = history.length;
    const maxHistoryLength = instance.maxHistory || 0;
    if (historyLength > maxHistoryLength) {
      history = history.slice(historyLength - maxHistoryLength);
    }

    await instance.update({ history });

    console.log(message);
  }
}

export default Instance;
