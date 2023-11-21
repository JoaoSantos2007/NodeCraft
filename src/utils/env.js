import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const PORT = process.env.PORT || 3000;
const DEBUG = process.env.DEBUG || false;
const SALT = process.env.SALT || null;
const SECRET = process.env.SECRET || null;
const ACCESS_TOKEN_LIFETIME = process.env.ACCESS_TOKEN_LIFETIME ? `${process.env.ACCESS_TOKEN_LIFETIME}m` : '15m';
const ABSOLUTE_PATH = process.env.ABSOLUTE_PATH || path.resolve();
const INSTANCES_PATH = process.env.INSTANCES_PATH || `${ABSOLUTE_PATH}/instances`;
const TEMPORARY_PATH = process.env.TEMPORARY_PATH || `${ABSOLUTE_PATH}/temp`;

if (!SALT || !SECRET) {
  throw new Error('Enviroment Variables Are Missing In .ENV');
}

export {
  PORT, DEBUG, SALT, SECRET, ACCESS_TOKEN_LIFETIME, ABSOLUTE_PATH, INSTANCES_PATH, TEMPORARY_PATH,
};
