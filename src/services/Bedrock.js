import BedrockScript from '../bedrock/Bedrock.js';
import BedrockModel from '../model/Bedrock.js';
import DuplicateError from '../errors/Duplicate.js';
import BadRequestError from '../errors/BadRequest.js';
import { bedrockInstances } from '../utils/instances.js';

class Bedrock {
  static async create(body) {
    const { name } = body;
    let instance = await BedrockModel.findOne({
      where: {
        name,
      },
    });

    if (instance) {
      throw new DuplicateError(`Instance ${name} already exists!`);
    }

    const data = Bedrock.extractInstanceList(body);

    instance = await BedrockModel.create(data);
    await BedrockScript.createInstance(instance);

    return instance;
  }

  static async readAll() {
    const instances = await BedrockModel.findAll();
    return instances;
  }

  static async readOne(id) {
    const instance = await BedrockModel.findOne({
      where: {
        id,
      },
    });

    if (!instance) throw new BadRequestError('Instance not found!');

    return instance;
  }

  static async update(id, body) {
    const data = Bedrock.extractInstanceList(body);

    const instance = await Bedrock.readOne(id);
    await instance.update(data);

    return instance;
  }

  static async delete(id) {
    const instance = await Bedrock.readOne(id);
    await BedrockScript.deleteInstance(instance.name);
    await instance.destroy();

    return instance;
  }

  static async run(id) {
    const instance = await Bedrock.readOne(id);

    let bedrockInstance = bedrockInstances[id];

    if (bedrockInstance) throw new BadRequestError('Instance already in progress');

    bedrockInstance = new BedrockScript(instance);
    bedrockInstances[id] = bedrockInstance;

    return instance;
  }

  static async stop(id) {
    const instance = await Bedrock.readOne(id);
    bedrockInstances[id].stop();
    bedrockInstances[id] = null;

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

export default Bedrock;
