import path from 'path';
import dotenv from 'dotenv';
import { existsSync, mkdirSync } from 'fs';

dotenv.config({ quiet: true });

const ABSOLUTE_PATH = path.resolve();
const STAGE = process.env.STAGE || 'PROD';
const PORT = process.env.PORT || 9183;
const API_URL = process.env.API_URL || `http://127.0.0.1:${PORT}`;
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
];
const REGISTRY = {};
const TEMPORARY_MAX_AGE = process.env.TEMPORARY_MAX_AGE || 5 * 60 * 1000;
const UPDATE_TIME_CHECK = process.env.UPDATE_TIME_CHECK || 5 * 60 * 1000;
const INSTANCE_MAX_AGE = process.env.INSTANCE_MAX_AGE || 2 * 24 * 60 * 60 * 1000;
const TIME_VERIFY_LOST = process.env.TIME_VERIFY_LOST || 60 * 60 * 1000;
const EMAIL_TOKEN_LIFETIME = process.env.EMAIL_TOKEN_LIFETIME || '24h';
const RESET_TOKEN_LIFETIME = process.env.RESET_TOKEN_LIFETIME || '1h';
const SMTP_HOST = process.env.SMTP_HOST || null;
const SMTP_PORT = process.env.SMTP_PORT || null;
const SMTP_SECURE = process.env.SMTP_SECURE || null;
const SMTP_USER = process.env.SMTP_USER || null;
const SMTP_PASS = process.env.SMTP_PASS || null;

if (!SALT || !SECRET) throw new Error('Enviroment Variables Are Missing In .ENV');
if (!existsSync(`${ABSOLUTE_PATH}/instances`)) mkdirSync(`${ABSOLUTE_PATH}/instances`);
if (!existsSync(`${ABSOLUTE_PATH}/temp`)) mkdirSync(`${ABSOLUTE_PATH}/temp`);

export {
  ABSOLUTE_PATH,
  INSTANCES_PATH,
  TEMPORARY_PATH,
  ACCESS_TOKEN_LIFETIME,
  PORT,
  API_URL,
  STAGE,
  SALT,
  SECRET,
  PERMISSIONS,
  MIN_PORT,
  MAX_PORT,
  REGISTRY,
  TEMPORARY_MAX_AGE,
  UPDATE_TIME_CHECK,
  INSTANCE_MAX_AGE,
  TIME_VERIFY_LOST,
  EMAIL_TOKEN_LIFETIME,
  RESET_TOKEN_LIFETIME,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
};
