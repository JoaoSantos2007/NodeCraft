import bcrypt from 'bcrypt';
import { SALT } from '../../config/settings.js';

const hash = (text) => bcrypt.hashSync(text, SALT);

export default hash;
