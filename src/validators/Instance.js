import Schema from '../schemas/Instance.js';
import validator from './validator.js';

const Instance = (data, instance = null) => {
  validator(data, Schema, instance);
};

export default Instance;
