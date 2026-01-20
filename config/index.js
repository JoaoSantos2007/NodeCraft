import path from 'path';
import fs from 'fs';

const ABSOLUTE_PATH = path.resolve(process.cwd());
const SETTINGS_PATH = path.join(ABSOLUTE_PATH, 'settings.json');
const TEMPLATE_PATH = path.join(ABSOLUTE_PATH, 'src', 'templates', 'settings', 'config.json');

if (!fs.existsSync(SETTINGS_PATH)) {
  const template = fs.readFileSync(TEMPLATE_PATH);
  fs.writeFileSync(SETTINGS_PATH, template);
}

let config;
try {
  const rawData = fs.readFileSync(SETTINGS_PATH, 'utf8');
  config = JSON.parse(rawData);
} catch (err) {
  throw new Error('settings.json is corrupt!');
}

config.absoutePath = ABSOLUTE_PATH;
config.instance.path ??= path.join(ABSOLUTE_PATH, 'instances');
config.temp.path ??= path.join(ABSOLUTE_PATH, 'temp');

export default Object.freeze(config);
