import {
  mkdirSync,
  rmSync,
  existsSync,
  writeFileSync,
  readFileSync,
  readdirSync,
} from 'fs';
import { Op } from 'sequelize';
import { Rcon } from 'rcon-client';
import { Instance as Model, Link as LinkModel, User as UserModel } from '../models/index.js';
import { BadRequest } from '../errors/index.js';
import download from '../utils/download.js';
import { getInfo } from '../utils/getVersion.js';
import Container from './Container.js';
import { syncFloodgate, syncGeyser, syncProperties } from '../utils/syncSettings.js';
import queryMinecraft from '../utils/queryMinecraft.js';
import Link from './Link.js';
import REGISTRY from '../../config/registry.js';
import config from '../../config/index.js';
import Storage from './Storage.js';
import File from './File.js';

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
    mkdirSync(`${config.instance.path}/${instance.id}`);

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
    rmSync(`${config.instance.path}/${id}`, { recursive: true, force: true });

    return instance;
  }

  static async backup(id) {
    // Stop minecraft saving

    // Make backup locally
    const backupPath = await File.makeBackup(id);

    // Delete old backups locally
    File.deleteOldBackups(id, backupPath);

    // Send backup to bucket
    if (config.storage.enable) await Storage.backup(id, backupPath);
  }

  static async backupAll() {
    const instances = await Instance.readAll();

    instances.forEach(async (instance) => {
      if (!instance.backup) return;
      await Instance.backup(instance.id);
    });
  }

  static async install(instance, force = false) {
    // Get Info updates and verify if need updates
    const info = await getInfo(instance);
    if (info.neededUpdates === 0 && !force) return { info, updating: false };

    // Define variables for download process
    const needRestart = instance.running; // Verify if the instance will need restart
    const instancePath = `${config.instance.path}/${instance.id}`;
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
    for (let port = config.instance.minPort; port <= config.instance.maxPort; port += 1) {
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
    const instance = await Instance.readOne(id);
    const path = `${config.instance.path}/${id}`;

    const container = await Container.getOrCreate(instance);

    // Setup ambient to run instance
    Instance.setup(instance, path);

    await Container.run(container);
    Instance.register(instance);

    // Set container listen
    Container.listen(id, (msg) => {
      Instance.updateHistory(id, msg);

      if (msg.includes('joined the game') || msg.includes('left the game')) {
        Instance.monitor(id);
      }

      console.log(msg);
    });

    // Set instance rcon
    Instance.verifyRcon(id);

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
    const instancesId = readdirSync(config.instance.path);
    if (!instancesId) return;

    instancesId.forEach(async (id) => {
      const pendingDeletePath = `${config.instance.path}/${id}/.delete-pending.json`;
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
        const rawData = readFileSync(`${config.instance.path}/${id}/.delete-pending.json`, 'utf8');
        const data = JSON.parse(rawData);

        const time = Number(data?.time);
        const now = Date.now();

        if (!time || now - time >= config.instance.lifetime) {
          // Delete pending instance
          rmSync(`${config.instance.path}/${id}`, { recursive: true, force: true });
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
        onlinePlayers: 0,
        players: [],
        ping: null,
      },
      barrier: {
        authorizedGamertags: [],
        superGamertags: [],
        allowMonitored: false,
        needUpdate: true,
        applyRules: true,
      },
      lastMonitoringRun: 0,
      instance,
      stream: null,
      interval: setInterval(() => Instance.monitor(instance.id), 5000),
      rcon: null,
      buffer: '',
    };
  }

  static async verifyRcon(id) {
    try {
      if (REGISTRY[id].rcon) return;

      const containerIpAddress = await Container.getIpAddress(id);
      const rcon = await Rcon.connect({
        host: containerIpAddress,
        port: 25575,
        password: 'nodecraft',
      });

      REGISTRY[id].rcon = rcon;
    } catch {
      REGISTRY[id].rcon = null;
    }
  }

  static async verifyBarrier(id) {
    const registry = REGISTRY[id];
    if (!registry) return;

    const { barrier, instance, state } = registry;
    const { authorizedGamertags, superGamertags } = barrier;
    const { players } = state;
    const instancePlain = instance.get({ plain: true });

    if (barrier.needUpdate) {
      // Wipe barrier gamertags
      barrier.authorizedGamertags = [];
      barrier.superGamertags = [];

      const links = instancePlain.players || [];
      links.forEach((link) => {
        const user = link.user || null;
        const access = link?.access;
        const gamertags = [];

        if (user) gamertags.push(...[user?.javaGamertag, user?.bedrockGamertag]);
        else gamertags.push(...[link.javaGamertag, link.bedrockGamertag]);

        if (access === 'super') {
          authorizedGamertags.push(...gamertags);
          superGamertags.push(...gamertags);
        } else if (access === 'always') {
          authorizedGamertags.push(...gamertags);
        } else if (access === 'monitored') {
          if (barrier.allowMonitored) authorizedGamertags.push(...gamertags);
        }
      });

      barrier.needUpdate = false;
      barrier.applyRules = true;
    }

    // Get rcon
    const rcon = registry?.rcon;
    if (!rcon) return;

    if (barrier.applyRules) {
      // Wipe allowlist

      // Set allowlist

      // Wipe privileges

      // Set privileges
    }

    // Kick players without authorized gamertag
    players.forEach((player) => {
      if (!authorizedGamertags.includes(player)) console.log('Kick player');
    });
  }

  static async updateState(id) {
    const registry = REGISTRY[id];
    if (!registry) return;

    const state = await queryMinecraft(registry.instance.port);
    const { players } = state;
    const { barrier } = registry;
    const { superGamertags } = barrier;

    // Verify barrier need update state
    const allowMonitored = superGamertags.some((gamertag) => players.includes(gamertag));
    if (allowMonitored !== barrier.allowMonitored) barrier.needUpdate = true;
    barrier.allowMonitored = allowMonitored;

    registry.state = {
      alive: state.online,
      onlinePlayers: state.onlinePlayers,
      players: state.players,
      ping: state.ping,
    };
  }

  static async monitor(id) {
    const registry = REGISTRY[id];
    if (!registry) return;

    // Verify last run

    try {
      await Instance.verifyRcon(id);
      await Instance.updateState(id);
      await Instance.verifyBarrier(id);

      console.log('ok');
    } catch (err) {
      console.log(err);
      // console.error('[MONITOR]', err);
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
