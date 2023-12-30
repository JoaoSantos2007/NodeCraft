import Instance from '../model/Instance.js';
import Bedrock from '../model/Bedrock.js';
import Java from '../model/Java.js';
import validator from './validator.js';

const instanceValidator = (data, instance = null) => {
  validator(data, Instance, instance);

  if (data.properties) {
    // Define Instance type
    let { type } = data;
    if (instance) type = instance.type;

    // Analize Properties Object
    const { properties } = data;
    if (type === 'bedrock') validator(properties, Bedrock, instance ? instance.properties : null);
    else if (type === 'java') validator(properties, Java, instance ? instance.properties : null);
  }
};

export default instanceValidator;
