/* eslint-disable no-console */
import path from 'path';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

// Equivalente ao __dirname em ES Modules
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const CONFIG_PATH = path.join(dirname, 'settings.json');
dotenv.config();

// eslint-disable-next-line import/no-mutable-exports
let config = {};
try {
  const rawData = readFileSync(CONFIG_PATH, 'utf-8');
  config = JSON.parse(rawData);
} catch (error) {
  console.error('Erro ao carregar configurações:', error.message);
  process.exit(1); // Encerra o programa se o arquivo não puder ser carregado
}

const PORT = process.env.PORT || 3000;
const DEBUG = process.env.DEBUG || false;
const SALT = process.env.SALT || '$2b$10$iXyVMT9A121GYTBibPIt6e';
const SECRET = process.env.SECRET || '4246e8f9e71b0b086b3b194a4bcb5d07c94dd773dddb51752183f7e9c82c543f';
const ABSOLUTE_PATH = path.resolve();
const INSTANCES_PATH = config.instancesPath || `${ABSOLUTE_PATH}/instances`;
const TEMPORARY_PATH = config.temporaryPath || `${ABSOLUTE_PATH}/temp`;
const ACCESS_TOKEN_LIFETIME = config.accessTokenLifetime || '15m';
const INSTANCES = {};

if (!SALT || !SECRET) {
  throw new Error('Enviroment Variables Are Missing In .ENV');
}

export {
  ABSOLUTE_PATH,
  INSTANCES_PATH,
  TEMPORARY_PATH,
  ACCESS_TOKEN_LIFETIME,
  PORT,
  DEBUG,
  SALT,
  SECRET,
  INSTANCES,
  config,
};
