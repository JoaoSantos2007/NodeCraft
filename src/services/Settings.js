import { writeFileSync } from 'fs';
import Validator from '../validators/Settings.js';
import { ABSOLUTE_PATH, config } from '../../config/settings.js';

class Settings {
  static read() {
    return config;
  }

  static update(data) {
    Validator(data);
    const newConfig = { ...config };

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(data)) newConfig[key] = value;

    const json = JSON.stringify(newConfig, null, 2);
    writeFileSync(`${ABSOLUTE_PATH}/config/settings.json`, json, 'utf-8');
  }
}

export default Settings;
