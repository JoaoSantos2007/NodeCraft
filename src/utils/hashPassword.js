import bcrypt from 'bcrypt';
import { SALT } from '../../config/settings.js';

const hashPassword = (password) => bcrypt.hashSync(password, SALT);

export default hashPassword;
