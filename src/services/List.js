/* eslint-disable dot-notation */
/* eslint-disable no-param-reassign */
import { readFileSync, rmSync, writeFileSync } from 'fs';
import { ABSOLUTE_PATH } from '../../config/settings.js';

class List {
  static get(path, doc) {
    let data = null;

    try {
      data = readFileSync(`${path}/server.properties`, 'utf8');
    } catch (err) {
      if (doc.type === 'bedrock') data = readFileSync(`${ABSOLUTE_PATH}/config/bedrock.properties`, 'utf8');
      else data = readFileSync(`${ABSOLUTE_PATH}/config/java.properties`, 'utf8');
    }

    // Extract properties
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

  static applyChanges(list, instance) {
    list['server-name'] = instance.name;
    list['gamemode'] = instance.gamemode;
    list['force-gamemode'] = instance.forceGamemode;
    list['difficulty'] = instance.difficulty;
    list['max-players'] = instance.maxPlayers;
    list['online-mode'] = instance.licensed;
    list['server-port'] = instance.port;
    list['view-distance'] = instance.viewDistance;
    list['player-idle-timeout'] = instance.idle;
    list['level-seed'] = instance.seed;
    list['motd'] = instance.motd;
    list['server-port'] = 19132;

    if (instance.type === 'bedrock') {
      // Bedrock settings
      list['allow-cheats'] = instance.cheats;
      list['allow-list'] = instance.allowlist;
      list['server-portv6'] = 19133;
      list['enable-lan-visibility'] = false;
    } else if (instance.type === 'java') {
      // Java settings
      list['enable-command-block'] = instance.commandBlock;
      list['enforce-secure-profile'] = instance.secureProfile;
      list['pvp'] = instance.pvp;
      list['allow-nether'] = instance.nether;
      list['hardcore'] = instance.hardcore;
      list['white-list'] = instance.allowlist;
      list['spawn-npcs'] = instance.npcs;
      list['spawn-animals'] = instance.animals;
      list['level-type'] = instance.levelType;
      list['spawn-monsters'] = instance.monsters;
      list['enforce-whitelist'] = instance.allowlist;
      list['spawn-protection'] = instance.spawn;
    }
  }

  static convertToString(list) {
    let propertiesInString = '';
    const propertiesFields = Object.entries(list);

    for (let index = 0; index < propertiesFields.length; index += 1) {
      const field = propertiesFields[index];
      propertiesInString += `${field[0]}=${field[1]}\n`;
    }

    return propertiesInString;
  }

  static save(path, list) {
    const listInString = List.convertToString(list);

    writeFileSync(`${path}/server.properties`, listInString);
  }

  static sync(path, doc) {
    const serverProperties = List.get(path, doc);
    List.applyChanges(serverProperties, doc);
    List.save(path, serverProperties);
  }

  static redefine(path, doc) {
    rmSync(`${path}/server.properties`, { force: true });
    List.sync(path, doc);
  }
}

export default List;
