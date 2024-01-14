import bcrypt from 'bcrypt';
import { SALT } from './env.js';

const hashPassword = (password) => bcrypt.hashSync(password, SALT);

export default hashPassword;
