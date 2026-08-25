import crypto from 'crypto';

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const generateRandomToken = () => crypto.randomBytes(64).toString('hex');

const compareToken = (token, storedHash) => {
  if (typeof storedHash !== 'string') return false;

  const hashed = hashToken(token);
  if (hashed.length !== storedHash.length) return false;

  return crypto.timingSafeEqual(Buffer.from(hashed), Buffer.from(storedHash));
};

export { hashToken, generateRandomToken, compareToken };
