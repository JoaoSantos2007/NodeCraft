import Instance from './Instance.js';
import Bedrock from './Bedrock.js';
import Java from './Java.js';

class World {
  static async download(id, worldType) {
    const instance = await Instance.readOne(id);
    const { type } = instance;

    let path = null;
    if (type === 'bedrock') path = await Bedrock.downloadWorld(instance);
    else if (type === 'java') path = await Java.downloadWorld(instance, worldType);

    return path;
  }

  static async upload(id, uploadPath, worldType) {
    const instance = await Instance.readOne(id);

    const { type } = instance;
    if (type === 'bedrock') await Bedrock.uploadWorld(instance, uploadPath);
    else if (type === 'java') await Java.uploadWorld(instance, uploadPath, worldType);

    return instance;
  }

  static async delete(id, worldType) {
    const instance = await Instance.readOne(id);

    const { type } = instance;
    if (type === 'bedrock') await Bedrock.deleteWorld(instance);
    else if (type === 'java') await Java.deleteWorld(instance, worldType);

    return instance;
  }
}

export default World;
