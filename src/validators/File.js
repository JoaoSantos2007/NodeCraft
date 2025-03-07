import Schema from '../schemas/File.js';
import validator from './validator.js';

const File = (data) => {
  validator(data, Schema);
};

export default File;
