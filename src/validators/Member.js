import Schema from '../schemas/Member.js';
import validator from './validator.js';

const Member = (data, isUpdate = false, firstTime = false) => {
  validator(data, Schema, isUpdate, firstTime);
};

export default Member;
