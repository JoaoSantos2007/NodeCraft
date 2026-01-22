import Schema from '../schemas/Link.js';
import validator from './validator.js';

const Link = (data, isUpdate = false, firstTime = false) => {
  validator(data, Schema, isUpdate, firstTime);
};

export default Link;
