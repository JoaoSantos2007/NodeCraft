import Schema from '../schemas/Settings.js';
import validator from './validator.js';

const Settings = (data) => {
  validator(data, Schema);
};

export default Settings;
