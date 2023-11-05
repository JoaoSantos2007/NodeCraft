import fs from 'fs';

class Propreties {
  static getPropertiesListDB(data) {
    const properties = {
      'server-name': data.name,
      gamemode: data.gamemode,
      'force-gamemode': data.forceGamemode,
      difficulty: data.difficulty,
      'allow-cheats': data.allowCheats,
      'max-players': data.maxPlayers,
      'online-mode': data.onlineMode,
      'allow-list': data.enableAllowList,
      'server-port': data.serverPort,
      'server-portv6': data.serverPortV6,
      'enable-lan-visibility': data.enableLan,
      'view-distance': data.viewDistance,
      'tick-distance': data.tickDistance,
      'player-idle-timeout': data.playerIdleTimeout,
      'max-threads': data.maxThreads,
      'level-name': data.name,
      'default-player-permission-level': data.defaultPlayerPermissionLevel,
      'texturepack-required': data.texturepackRequired,
      'content-log-file-enabled': data.contentLogFileEnabled,
      'compression-threshold': data.compressionThreshold,
      'compression-algorithm': data.compressionAlgorithm,
      'server-authoritative-movement': data.serverAuthoritativeMovement,
      'player-movement-score-threshold': data.playerMovementScoreThreshold,
      'player-movement-action-direction-threshold': data.playerMovementActionDirectionThreshold,
      'player-movement-distance-threshold': data.playerMovementDistanceThreshold,
      'player-movement-duration-threshold-in-ms': data.playerMovementDurationThresholdInMs,
      'correct-player-movement': data.correctPlayerMovement,
      'server-authoritative-block-breaking': data.serverAuthoritativeBlockBreaking,
      'chat-restriction': data.chatRestriction,
      'disable-player-interaction': data.disablePlayerInteraction,
      'client-side-chunk-generation-enabled': data.clientSideChunkGenerationEnabled,
      'block-network-ids-are-hashes': data.blockNetworkIdsAreHashes,
      'disable-persona': data.disablePersona,
      'disable-custom-skins': data.disableCustomSkins,
    };

    return properties;
  }

  static getPropertiesListLocal(path) {
    const data = fs.readFileSync(`${path}/server.properties`, 'utf8');
    const lines = data.split('\n');
    const properties = {};

    for (let index = 0; index < lines.length; index += 1) {
      const line = (lines[index].split('#'))[0]; // Eliminate commented lines too
      const [key, value] = line.split('=');
      if (key && value) {
        properties[key.trim()] = value.trim();
      }
    }

    return properties;
  }

  static mergeLists(propertiesListDB, propertiesListLocal) {
    const properties = propertiesListDB;

    const keysProperties = Object.keys(properties);
    const keysPropertiesListLocal = Object.keys(propertiesListLocal);

    // Adiciona um campo se a lista remota não tiver
    for (let index = 0; index < keysPropertiesListLocal.length; index += 1) {
      const key = keysPropertiesListLocal[index];

      if (keysProperties.indexOf(key) < 0) {
        properties[key] = propertiesListLocal[key];
      }
    }

    return properties;
  }

  static convertObjectToPropertiesString(list) {
    let propertiesInString = '';
    const propertiesFields = Object.entries(list);

    for (let index = 0; index < propertiesFields.length; index += 1) {
      const field = propertiesFields[index];
      propertiesInString += `${field[0]}=${field[1]}\n`;
    }

    return propertiesInString;
  }

  static savePropertiesList(path, list) {
    const listInString = Propreties.convertObjectToPropertiesString(list);

    fs.writeFileSync(`${path}/server.properties`, listInString);
  }

  static syncPropertiesLists(path, data) {
    const propertiesListDB = Propreties.getPropertiesListDB(data);
    const propertiesListLocal = Propreties.getPropertiesListLocal(path);
    const mergedList = Propreties.mergeLists(propertiesListDB, propertiesListLocal);
    Propreties.savePropertiesList(path, mergedList);
  }
}

export default Propreties;
