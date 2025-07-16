import Schema from '../schemas/Role.js';
import validator from './validator.js';

const Role = (data, isUpdate = false, firstTime = false) => {
  validator(data, Schema, isUpdate, firstTime);
};

export default Role;
