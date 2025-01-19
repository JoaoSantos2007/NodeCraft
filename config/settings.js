import path from 'path';
import dotenv from 'dotenv';
import { existsSync, mkdirSync, readFileSync } from 'fs';

dotenv.config();
const ABSOLUTE_PATH = path.resolve();

const rawConfig = readFileSync(`${ABSOLUTE_PATH}/config/settings.json`, 'utf-8');
const config = JSON.parse(rawConfig);

const PORT = process.env.PORT || 3000;
const SALT = process.env.SALT || '$2b$10$iXyVMT9A121GYTBibPIt6e';
const SECRET = process.env.SECRET || '4246e8f9e71b0b086b3b194a4bcb5d07c94dd773dddb51752183f7e9c82c543f';
const INSTANCES_PATH = config.instancesPath || `${ABSOLUTE_PATH}/instances`;
const TEMPORARY_PATH = config.temporaryPath || `${ABSOLUTE_PATH}/temp`;
const ACCESS_TOKEN_LIFETIME = config.accessTokenLifetime || '15m';
const PERMISSIONS = config.permissions || [];
const STAGE = process.env.STAGE || 'PROD';
const INSTANCES = {};

if (!SALT || !SECRET) throw new Error('Enviroment Variables Are Missing In .ENV');
if (!existsSync(`${ABSOLUTE_PATH}/instances`)) mkdirSync(`${ABSOLUTE_PATH}/instances`);
if (!existsSync(`${ABSOLUTE_PATH}/temp`)) mkdirSync(`${ABSOLUTE_PATH}/temp`);

export {
  ABSOLUTE_PATH,
  INSTANCES_PATH,
  TEMPORARY_PATH,
  ACCESS_TOKEN_LIFETIME,
  PORT,
  STAGE,
  SALT,
  SECRET,
  INSTANCES,
  PERMISSIONS,
  config,
};
