/* eslint-disable consistent-return */
/* eslint-disable no-new */
import { mkdirSync, rmSync, existsSync } from 'fs';
import { Op } from 'sequelize';
import AdmZip from 'adm-zip';
import { INSTANCES_PATH, MIN_PORT, MAX_PORT } from '../../config/settings.js';
import { Instance as Model, Player as PlayerModel } from '../models/index.js';
import { BadRequest } from '../errors/index.js';
import Temp from './Temp.js';
import AccessGuard from './AccessGuard.js';
import download from '../utils/download.js';
import getVersion from '../utils/getVersion.js';
import Container from './Container.js';
import { syncFloodgate, syncGeyser, syncProperties } from '../utils/syncSettings.js';

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

    return instance;
  }

  static async readAll() {
    const instances = await Model.findAll({ include: { model: PlayerModel, as: 'players' } });
    return instances;
  }

  static async readOne(id) {
    const instance = await Model.findByPk(id, { include: { model: PlayerModel, as: 'players' } });
    if (!instance) throw new BadRequest('Instance not found!');

    return instance;
  }

  static async readAllByOwner(ownerId) {
    const instances = await Model.findAll({
      where: {
        owner: ownerId,
      },
    });

    return instances;
  }

  static async readAllByOwners(ownerIds) {
    const instances = await Model.findAll({
      where: {
        owner: {
          [Op.in]: ownerIds,
        },
      },
    });

    return instances;
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

    if (instance.type === 'bedrock') {
      // Get Bedrock latest info
      const instanceInfo = await getVersion('bedrock');

      info.instanceVersion = instanceInfo?.version;
      info.instanceUrl = instanceInfo?.url;
    }

    if (instance.type === 'java') {
      let geyserInfo;
      let floodgateInfo;

      // Get Java latest info
      const instanceInfo = await getVersion(instance.software);

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
    }

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
    const tempPath = instance.type === 'bedrock' ? Temp.create() : '';
    const downloadCommand = instance.type === 'bedrock' ? `${tempPath}/bedrock.zip` : `${instancePath}/server.jar`;
    let downloadsCompleted = 0;

    // Start the instance install process in the background
    if (info.needInstanceUpdate) {
      download(downloadCommand, info.instanceUrl).then(async () => {
        // Stop and Wait Instance for update
        await Instance.stopAndWait(instance.id);

        // Extract installer.zip if instance is bedrock type
        if (instance.type === 'bedrock') {
          const zip = new AdmZip(`${tempPath}/bedrock.zip`);
          zip.extractAllTo(instancePath, true);
          Temp.delete(tempPath);
        }

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
    AccessGuard.wipe(instance, path);

    // Remove session.lock
    if (existsSync(`${path}/world/session.lock`)) rmSync(`${path}/world/session.lock`, { recursive: true });

    // Ensure geyser
    if (instance.geyser) {
      syncGeyser(instance, path);
      syncFloodgate(instance, path);
    }
  }

  static async run(id) {
    // Read instance
    const instance = await Instance.readOne(id);
    const path = `${INSTANCES_PATH}/${id}`;

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

    // Set listeners
    await Instance.setListeners(instance);

    await instance.update({ running: true });

    return instance;
  }

  static async setListeners(instance) {
    const container = await Container.get(instance.id);

    const stream = await container.logs({
      stdout: true,
      stderr: true,
      follow: true,
    });

    stream.on('data', async (chunk) => {
      const output = chunk.toString();
      console.log(output);

      // AccessGuard.analyzer(output, this);
      await Instance.updateHistory(instance, output);
    });
  }

  static async stop(id) {
    const instance = await Instance.readOne(id);
    const container = await Container.get(id);

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
