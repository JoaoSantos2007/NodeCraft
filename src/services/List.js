import { readFileSync, writeFileSync } from 'fs';
import { ABSOLUTE_PATH } from '../../config/settings.js';

class List {
  static get(type) {
    let path = `${ABSOLUTE_PATH}/config/bedrock.properties`;
    if (type !== 'bedrock') path = `${ABSOLUTE_PATH}/config/java.properties`;
    const data = readFileSync(path, 'utf8');

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

  static merge(propertiesListDB, propertiesListLocal) {
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

  static sync(path, settings) {
    const propertiesListDB = settings.properties;
    const propertiesListLocal = List.get(path);
    const mergedList = List.merge(propertiesListDB, propertiesListLocal);
    List.save(path, mergedList);
  }
}

export default List;
