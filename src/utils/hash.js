import bcrypt from 'bcrypt';
import crypto from 'crypto';

const hashPassword = (password) => bcrypt.hashSync(password, 12);

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export {
  hashPassword,
  hashToken,
};
