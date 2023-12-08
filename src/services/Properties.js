import fs from 'fs';

class Propreties {
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

  static syncPropertiesLists(path, settings) {
    const propertiesListDB = settings.properties;
    const propertiesListLocal = Propreties.getPropertiesListLocal(path);
    const mergedList = Propreties.mergeLists(propertiesListDB, propertiesListLocal);
    Propreties.savePropertiesList(path, mergedList);
  }
}

export default Propreties;
