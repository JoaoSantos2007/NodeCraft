import Instance from '../models/Instance.js';
import validator from './validator.js';

const instanceValidator = (data, instance = null) => {
  validator(data, Instance, instance);
};

export default instanceValidator;
