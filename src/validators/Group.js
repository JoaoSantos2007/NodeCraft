import Schema from '../schemas/Group.js';
import validator from './validator.js';

const Group = (data, isUpdate = false) => {
  validator(data, Schema, isUpdate);
};

export default Group;
