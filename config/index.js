import path from 'path';
import fs from 'fs';

const ABSOLUTE_PATH = path.resolve(process.cwd());
const SETTINGS_PATH = `${ABSOLUTE_PATH}/settings.json`;
const TEMPLATE_PATH = `${ABSOLUTE_PATH}/src/templates/json/config.json`;

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
config.instance.path ??= `${ABSOLUTE_PATH}/instances`;
config.temp.path ??= `${ABSOLUTE_PATH}/temp`;

if (!fs.existsSync(config.instance.path)) fs.mkdirSync(config.instance.path);
if (!fs.existsSync(config.temp.path)) fs.mkdirSync(config.temp.path);

export default Object.freeze(config);
