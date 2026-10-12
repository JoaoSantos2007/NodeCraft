import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const absoutePath = path.resolve(process.cwd());
const MIB = 1024 * 1024;

const fileLimitBytes = (name, defaultMb) => {
  const mb = process.env[name] ? Number(process.env[name]) : defaultMb;

  if (!Number.isSafeInteger(mb) || mb <= 0 || mb > Number.MAX_SAFE_INTEGER / MIB) {
    throw new Error(`${name} must be a positive integer in MiB`);
  }

  return mb * MIB;
};

const config = {
  app: {
    port: process.env.PORT || 9184,
    stage: process.env.STAGE || 'PROD',
    id: process.env.WORKER_ID,
  },
  log: {
    // pino level: trace | debug | info | warn | error | fatal | silent
    level: process.env.LOG_LEVEL || 'info',
  },
  paths: {
    absolute: absoutePath,
    instances: process.env.INSTANCE_PATH || path.join(absoutePath, 'instances'),
    temp: process.env.TEMP_PATH || path.join(absoutePath, 'temp'),
  },
  files: {
    maxUploadBytes: fileLimitBytes('FILE_MAX_UPLOAD_MB', 512),
    maxOperationBytes: fileLimitBytes('FILE_MAX_OPERATION_MB', 2048),
    minFreeBytes: fileLimitBytes('FILE_MIN_FREE_MB', 512),
  },
  manager: {
    url: process.env.MANAGER_URL,
    apiKey: process.env.MANAGER_API_KEY,
    secret: process.env.MANAGER_SECRET,
    timeout: process.env.MANAGER_TIMEOUT ? Number(process.env.MANAGER_TIMEOUT) : 15000,
  },
  storage: {
    enable: process.env.STORAGE_ENABLE,
    bucket: process.env.STORAGE_BUCKET,
    region: process.env.STORAGE_REGION,
    endpoint: process.env.STORAGE_ENDPOINT,
    forcePathStyle: process.env.STORAGE_FORCE_PATHSTYLE,
    id: process.env.STORAGE_ID,
    secret: process.env.STORAGE_SECRET,
    max: process.env.STORAGE_MAX,
  },
  system: {
    puid: process.env.PUID || 1000,
    pgid: process.env.PGID || 1000,
  },
  images: {
    minecraft: 'itzg/minecraft-server:latest',
    kerbal: 'ghcr.io/jsantos43/ksp:latest',
    hytale: 'indifferentbroccoli/hytale-server-docker:latest',
    terraria: 'ghcr.io/passivelemon/terraria-docker:latest',
  },
};

export default Object.freeze(config);
