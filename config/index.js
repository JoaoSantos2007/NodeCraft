import fs from 'fs';
import path from 'path';
import syncWithTemplate from '../src/utils/syncWithTemplate.js';

// Resolve paths
const ABSOLUTE_PATH = path.resolve(process.cwd());
const SETTINGS_PATH = path.join(ABSOLUTE_PATH, 'config.json');
const TEMPLATE_PATH = path.join(ABSOLUTE_PATH, 'src', 'templates', 'settings', 'settings.json');

// Read settings.json template
const template = JSON.parse(fs.readFileSync(TEMPLATE_PATH, 'utf8'));

// Get settings.json actual state
let currentConfig = {};
if (fs.existsSync(SETTINGS_PATH)) {
  try {
    currentConfig = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
  } catch {
    throw new Error('settings.json is corrupt!');
  }
}

// Sync config.json with template
const config = syncWithTemplate(template, currentConfig);
fs.writeFileSync(
  SETTINGS_PATH,
  JSON.stringify(config, null, 2),
);

config.absoutePath = ABSOLUTE_PATH;
config.instance.path ??= path.join(ABSOLUTE_PATH, 'instances');
config.temp.path ??= path.join(ABSOLUTE_PATH, 'temp');

export default Object.freeze(config);
