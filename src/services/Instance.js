import Bedrock from '../bedrock/Bedrock.js';

class Instance {
  static async create({ name }) {
    await Bedrock.createInstance(name);
  }
}

export default Instance;
