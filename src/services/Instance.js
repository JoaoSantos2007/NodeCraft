import Bedrock from '../bedrock/Bedrock.js';
import InstanceModel from '../model/Instance.js';
import DuplicateError from '../errors/Duplicate.js';
import BadRequestError from '../errors/BadRequest.js';
import instancesList from '../utils/instances.js';

class Instance {
  static async create(body) {
    const { name } = body;
    let instance = await InstanceModel.findOne({
      where: {
        name,
      },
    });

    if (instance) {
      throw new DuplicateError(`Instance ${name} already exists!`);
    }

    const data = Instance.extractInstanceList(body);

    instance = await InstanceModel.create(data);
    await Bedrock.createInstance(instance);

    return instance;
  }

  static async readAll() {
    const instances = await InstanceModel.findAll();
    return instances;
  }

  static async readOne(id) {
    const instance = await InstanceModel.findOne({
      where: {
        id,
      },
    });

    if (!instance) throw new BadRequestError('Instance not found!');

    return instance;
  }

  static async update(id, body) {
    const data = Instance.extractInstanceList(body);

    const instance = await Instance.readOne(id);
    await instance.update(data);

    return instance;
  }

  static async delete(id) {
    const instance = await Instance.readOne(id);
    await Bedrock.deleteInstance(instance.name);
    await instance.destroy();

    return instance;
  }

  static async run(id) {
    const instance = await Instance.readOne(id);

    const bedrockInstance = new Bedrock(instance);
    instancesList[id] = bedrockInstance;

    return instance;
  }

  static async stop(id) {
    const instance = await Instance.readOne(id);
    instancesList[id].stop();

    return instance;
  }

  static extractInstanceList(data) {
    const list = {
      name: data.name,
      gamemode: data.gamemode,
      forceGamemode: data.forceGamemode,
      difficulty: data.difficulty,
      allowCheats: data.allowCheats,
      maxPlayers: data.maxPlayers,
      enableAllowList: data.enableAllowList,
      serverPort: data.serverPort,
      serverPortV6: data.serverPortV6,
      enableLan: data.enableLan,
      viewDistance: data.viewDistance,
      tickDistance: data.tickDistance,
      playerIdleTimeout: data.playerIdleTimeout,
      maxThreads: data.maxThreads,
      defaultPlayerPermissionLevel: data.defaultPlayerPermissionLevel,
      texturepackRequired: data.texturepackRequired,
      contentLogFileEnabled: data.contentLogFileEnabled,
      compressionThreshold: data.compressionThreshold,
      compressionAlgorithm: data.compressionAlgorithm,
      serverAuthoritativeMovement: data.serverAuthoritativeMovement,
      playerMovementScoreThreshold: data.playerMovementScoreThreshold,
      playerMovementActionDirectionThreshold: data.playerMovementActionDirectionThreshold,
      playerMovementDistanceThreshold: data.playerMovementDistanceThreshold,
      playerMovementDurationThresholdInMs: data.playerMovementDurationThresholdInMs,
      correctPlayerMovement: data.correctPlayerMovement,
      serverAuthoritativeBlockBreaking: data.serverAuthoritativeBlockBreaking,
      chatRestriction: data.chatRestriction,
      disablePlayerInteraction: data.disablePlayerInteraction,
      clientSideChunkGenerationEnabled: data.clientSideChunkGenerationEnabled,
      blockNetworkIdsAreHashes: data.blockNetworkIdsAreHashes,
      disablePersona: data.disablePersona,
      disableCustomSkins: data.disableCustomSkins,
    };

    return list;
  }
}

export default Instance;
