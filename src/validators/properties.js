import Bedrock from '../model/Bedrock.js';
import Java from '../model/Java.js';
import validator from './validator.js';

const propertiesValidator = (data, type = 'bedrock', instance = null) => {
  if (type === 'bedrock') validator(data, Bedrock, instance);
  else if (type === 'java') validator(data, Java, instance);
};

export default propertiesValidator;
