import Properties from '../models/Properties.js';
import validator from './validator.js';

const propertiesValidator = (data, properties, instanceType) => {
  validator(data, Properties, properties, instanceType);
};

export default propertiesValidator;
