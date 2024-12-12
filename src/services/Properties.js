import propertiesValidator from '../validators/properties.js';
import Instance from './Instance.js';
import NodeCraft from './NodeCraft.js';

class Properties {
  static read(id) {
    const instance = Instance.readOne(id);

    return instance.properties;
  }

  static update(id, data) {
    const instance = Instance.readOne(id);
    const { properties, type } = instance;
    propertiesValidator(data, properties, type);

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(data)) properties[key] = value;
    instance.properties = properties;
    NodeCraft.save(instance);

    return properties;
  }
}

export default Properties;
