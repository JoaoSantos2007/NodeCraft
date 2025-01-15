import File from '../models/File.js';
import validator from './validator.js';

const fileValidator = (data) => {
  validator(data, File);
};

export default fileValidator;
