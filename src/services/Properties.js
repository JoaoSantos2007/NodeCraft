import propertiesValidator from '../validators/properties.js';
import Instance from './Instance.js';
import NodeCraft from './NodeCraft.js';

class Properties {
  static async read(id) {
    const instance = await Instance.readOne(id);

    return instance.properties;
  }

  static async update(id, data) {
    const instance = await Instance.readOne(id);
    const { properties } = instance;
    propertiesValidator(data, instance.type, properties);

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(data)) properties[key] = value;
    instance.properties = properties;
    NodeCraft.save(instance);

    return properties;
  }
}

export default Properties;
