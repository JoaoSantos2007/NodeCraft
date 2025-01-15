import Settings from '../models/Settings.js';
import validator from './validator.js';

const settingsValidator = (data) => {
  validator(data, Settings);
};

export default settingsValidator;
