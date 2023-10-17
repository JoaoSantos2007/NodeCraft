import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;
const DEBUG = process.env.DEBUG || false;
const SALT = process.env.SALT || null;
const SECRET = process.env.SECRET || null;
const ACCESS_TOKEN_LIFETIME = process.env.ACCESS_TOKEN_LIFETIME ? `${process.env.ACCESS_TOKEN_LIFETIME}m` : '15m';

if (!SALT || !SECRET) {
  throw new Error('Enviroment Variables Are Missing In .ENV');
}

export {
  PORT, DEBUG, SALT, SECRET, ACCESS_TOKEN_LIFETIME,
};
