import { readFileSync, writeFileSync } from 'fs';
import { ABSOLUTE_PATH } from './env.js';

function getList(type) {
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

function mergeLists(propertiesListDB, propertiesListLocal) {
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

function convertObjectToPropertiesString(list) {
  let propertiesInString = '';
  const propertiesFields = Object.entries(list);

  for (let index = 0; index < propertiesFields.length; index += 1) {
    const field = propertiesFields[index];
    propertiesInString += `${field[0]}=${field[1]}\n`;
  }

  return propertiesInString;
}

function saveList(path, list) {
  const listInString = convertObjectToPropertiesString(list);

  writeFileSync(`${path}/server.properties`, listInString);
}

function syncLists(path, settings) {
  const propertiesListDB = settings.properties;
  const propertiesListLocal = getList(path);
  const mergedList = mergeLists(propertiesListDB, propertiesListLocal);
  saveList(path, mergedList);
}

export {
  syncLists,
  getList,
  mergeLists,
  convertObjectToPropertiesString,
  saveList,
};
