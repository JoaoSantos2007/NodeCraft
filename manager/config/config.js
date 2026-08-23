import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;

const siteUrl = (process.env.SITE_URL || 'http://localhost:3030').replace(/\/+$/, '');

const config = {
  app: {
    port: process.env.PORT
      ? Number(process.env.PORT)
      : 9183,
    isDev: process.env.STAGE === 'DEV',
    gmt: process.env.GMT
      ? Number(process.env.GMT)
      : 0,
    siteUrl,
    verifyUrl: `${siteUrl}/verify`,
    resetPasswordUrl: `${siteUrl}/reset`,
    corsOrigins: (process.env.CORS_ORIGIN || siteUrl)
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  },
  paths: {
    absolute: path.resolve(process.cwd()),
  },
  log: {
    // pino level: trace | debug | info | warn | error | fatal | silent
    level: process.env.LOG_LEVEL || 'info',
  },
  database: {
    enable: process.env.DATABASE_ENABLE === 'true',
    host: process.env.DATABASE_HOST || null,
    username: process.env.DATABASE_USER || null,
    password: process.env.DATABASE_PASSWORD || null,
    name: process.env.DATABASE_NAME || null,
    poolMax: process.env.DATABASE_POOL_MAX
      ? Number(process.env.DATABASE_POOL_MAX)
      : 20,
    poolAcquire: process.env.DATABASE_POOL_ACQUIRE
      ? Number(process.env.DATABASE_POOL_ACQUIRE)
      : 20 * ONE_SECOND,
    // In seconds (innodb_lock_wait_timeout), unlike every other duration here.
    lockWaitTimeout: process.env.DATABASE_LOCK_WAIT_TIMEOUT
      ? Number(process.env.DATABASE_LOCK_WAIT_TIMEOUT)
      : 10,
  },
  email: {
    enable: process.env.EMAIL_ENABLE === 'true',
    host: process.env.EMAIL_HOST || null,
    port: process.env.EMAIL_PORT
      ? Number(process.env.EMAIL_PORT)
      : null,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || null,
    password: process.env.EMAIL_PASSWORD || null,
  },
  token: {
    jwtSecret: process.env.JWT_SECRET
    || '4246e8f9e71b0b086b3b194a4bcb5d07c94dd773dddb51752183f7e9c82c543f',
    accessLifetime: 15 * ONE_MINUTE,
    emailLifetime: 1 * ONE_DAY,
    resetPasswordLifetime: 20 * ONE_MINUTE,
    refreshLifetime: 3 * ONE_DAY,
  },
  instance: {
    maxHistory: process.env.MAX_HISTORY
      ? Number(process.env.MAX_HISTORY)
      : 50,
    minPort: process.env.MIN_PORT
      ? Number(process.env.MIN_PORT)
      : 5621,
    maxPort: process.env.MAX_PORT
      ? Number(process.env.MAX_PORT)
      : 5671,
    permissions: [
      'instance:read',
      'instance:edit',
      'instance:execute',
      'instance:backup',
      'instance:console:read',
      'instance:console:write',
      'instance:files:read',
      'instance:files:write',
      'instance:files:edit',
      'instance:roster:edit',
    ],
  },
  roster: {
    access: ['host', 'member', 'guest'],
    platforms: ['java', 'bedrock', 'steam'],
    platformsByGame: {
      minecraft: ['java', 'bedrock'],
      counterstrike: ['steam'],
      terraria: ['steam'],
    },
  },
  resolvers: {
    steamApiKey: process.env.STEAM_API_KEY || null,
  },
};

const deepFreeze = (target) => {
  Object.values(target).forEach((value) => {
    if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) deepFreeze(value);
  });

  return Object.freeze(target);
};

export default deepFreeze(config);
