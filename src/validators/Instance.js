import Schema from '../schemas/Instance.js';
import validator from './validator.js';

const Instance = (data, isUpdate = false, firstTime = false) => {
  validator(data, Schema, isUpdate, firstTime);
};

export default Instance;
