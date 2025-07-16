import path from 'path';
import dotenv from 'dotenv';
import { existsSync, mkdirSync } from 'fs';

dotenv.config();

const ABSOLUTE_PATH = path.resolve();
const STAGE = process.env.STAGE || 'PROD';
const PORT = process.env.PORT || 3000;
const SALT = process.env.SALT || '$2b$10$iXyVMT9A121GYTBibPIt6e';
const SECRET = process.env.SECRET || '4246e8f9e71b0b086b3b194a4bcb5d07c94dd773dddb51752183f7e9c82c543f';
const INSTANCES_PATH = process.env.INSTANCES_PATH || `${ABSOLUTE_PATH}/instances`;
const TEMPORARY_PATH = process.env.TEMPORARY_PATH || `${ABSOLUTE_PATH}/temp`;
const ACCESS_TOKEN_LIFETIME = process.env.ACCESS_TOKEN_LIFETIME || '15m';
const MIN_PORT = process.env.MIN_PORT || 5621;
const MAX_PORT = process.env.MAX_PORT || 5671;
const PERMISSIONS = [
  'instance:read',
  'instance:create',
  'instance:update',
  'instance:delete',
  'instance:status',
  'instance:run',
  'instance:properties:read',
  'instance:properties:update',
  'instance:player:read',
  'instance:player:create',
  'instance:player:update',
  'instance:player:delete',
  'instance:file:read',
  'instance:file:unzip',
  'instance:file:create',
  'instance:file:update',
  'instance:file:delete',
  'instance:file:move',
  'group:read',
  'group:update',
  'group:delete',
  'group:role:read',
  'group:role:create',
  'group:role:update',
  'group:role:delete',
  'group:member:read',
  'group:member:create',
  'group:member:update',
  'group:member:delete',
];
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
  MIN_PORT,
  MAX_PORT,
};
