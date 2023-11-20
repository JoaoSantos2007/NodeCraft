import JavaModel from '../model/Java.js';
import DuplicateError from '../errors/Duplicate.js';
import BadRequestError from '../errors/BadRequest.js';
import JavaScript from '../java/Java.js';
import { javaInstances } from '../utils/instances.js';

class Java {
  static async create(body) {
    const { name } = body;
    let instance = await JavaModel.findOne({
      where: {
        name,
      },
    });

    if (instance) {
      throw new DuplicateError(`Instance ${name} already exists!`);
    }

    const data = Java.extractInstanceList(body);

    instance = await JavaModel.create(data);
    await JavaScript.createInstance(instance);

    return instance;
  }

  static async readAll() {
    const instances = await JavaModel.findAll();
    return instances;
  }

  static async readOne(id) {
    const instance = await JavaModel.findOne({
      where: {
        id,
      },
    });

    if (!instance) throw new BadRequestError('Instance not found!');

    return instance;
  }

  static async update(id, body) {
    const data = Java.extractInstanceList(body);

    const instance = await Java.readOne(id);
    await instance.update(data);

    return instance;
  }

  static async delete(id) {
    const instance = await Java.readOne(id);
    await JavaScript.deleteInstance(instance.name);
    await instance.destroy();

    return instance;
  }

  static async run(id) {
    const instance = await Java.readOne(id);

    const javaInstance = new JavaScript(instance);
    javaInstances[id] = javaInstance;

    return instance;
  }

  static async stop(id) {
    const instance = await Java.readOne(id);
    javaInstances[id].stop();

    return instance;
  }

  static extractInstanceList(data) {
    const list = {
      name: data.name,
      allowFlight: data.allowFlight,
      allowNether: data.allowNether,
      broadcastConsoleToOps: data.broadcastConsoleToOps,
      broadcastRconToOps: data.broadcastRconToOps,
      difficulty: data.difficulty,
      enableCommandBlock: data.enableCommandBlock,
      enableJmxMonitoring: data.enableJmxMonitoring,
      enableQuery: data.enableQuery,
      enableRcon: data.enableRcon,
      enableStatus: data.enableStatus,
      enforceSecureProfile: data.enforceSecureProfile,
      enforceWhitelist: data.enforceWhitelist,
      entityBroadcastRangePercentage: data.entityBroadcastRangePercentage,
      forceGamemode: data.forceGamemode,
      functionPermissionLevel: data.functionPermissionLevel,
      gamemode: data.gamemode,
      generateStructures: data.generateStructures,
      hardcore: data.hardcore,
      hideOnlinePlayers: data.hideOnlinePlayers,
      initialDisabledPacks: data.initialDisabledPacks,
      initialEnabledPacks: data.initialEnabledPacks,
      levelSeed: data.levelSeed,
      levelType: data.levelType,
      logIps: data.logIps,
      maxChainedNeighborUpdates: data.maxChainedNeighborUpdates,
      maxPlayers: data.maxPlayers,
      maxTickTime: data.maxTickTime,
      maxWorldSize: data.maxWorldSize,
      motd: data.motd,
      networkCompressionThreshold: data.networkCompressionThreshold,
      onlineMode: data.onlineMode,
      opPermissionLevel: data.opPermissionLevel,
      playerIdleTimeout: data.playerIdleTimeout,
      preventProxyConnections: data.preventProxyConnections,
      pvp: data.pvp,
      queryPort: data.queryPort,
      rateLimit: data.rateLimit,
      rconPassword: data.rconPassword,
      rconPort: data.rconPort,
      requireResourcePack: data.requireResourcePack,
      resourcePack: data.resourcePack,
      resourcePackPrompt: data.resourcePackPrompt,
      resourcePackSha1: data.resourcePackSha1,
      serverIp: data.serverIp,
      serverPort: data.serverPort,
      simulationDistance: data.simulationDistance,
      spawnAnimals: data.spawnAnimals,
      spawnMonsters: data.spawnMonsters,
      spawnNpcs: data.spawnNpcs,
      spawnProtection: data.spawnProtection,
      syncChunkWrites: data.syncChunkWrites,
      useNativeTransport: data.useNativeTransport,
      viewDistance: data.viewDistance,
      whiteList: data.whiteList,
    };

    return list;
  }
}

export default Java;
