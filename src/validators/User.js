import Schema from '../schemas/User.js';
import validator from './validator.js';

const User = (data, isUpdate = false, firstTime = false) => {
  validator(data, Schema, isUpdate, firstTime);
};

export default User;
