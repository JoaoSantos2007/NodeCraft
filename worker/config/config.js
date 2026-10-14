import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const absoutePath = path.resolve(process.cwd());
const MIB = 1024 * 1024;

const positiveLimit = (name, fallback, unit = 1) => {
  const value = process.env[name] ? Number(process.env[name]) : fallback;

  if (!Number.isSafeInteger(value) || value <= 0 || value > Number.MAX_SAFE_INTEGER / unit) {
    throw new Error(`${name} must be a positive integer (unit: ${unit})`);
  }

  return value * unit;
};

const fileLimitBytes = (name, defaultMb) => positiveLimit(name, defaultMb, MIB);

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
  http: {
    jsonBytes: positiveLimit('HTTP_JSON_KB', 100, 1024),
  },
  console: {
    maxPendingLines: positiveLimit('CONSOLE_MAX_PENDING_LINES', 20000),
    maxLineChars: positiveLimit('CONSOLE_MAX_LINE_CHARS', 1024 * 1024),
    maxHistoryBytes: fileLimitBytes('CONSOLE_MAX_HISTORY_MB', 8),
  },
  files: {
    maxPreviewBytes: fileLimitBytes('FILE_MAX_PREVIEW_MB', 10),
    maxDirectoryEntries: positiveLimit('FILE_MAX_DIRECTORY_ENTRIES', 10000),
    maxArchiveEntries: positiveLimit('FILE_MAX_ARCHIVE_ENTRIES', 10000),
    maxConcurrentReads: positiveLimit('FILE_MAX_CONCURRENT_READS', 4),
    maxUploadBytes: fileLimitBytes('FILE_MAX_UPLOAD_MB', 6144),
    maxOperationBytes: fileLimitBytes('FILE_MAX_OPERATION_MB', 6144),
    minFreeBytes: fileLimitBytes('FILE_MIN_FREE_MB', 512),
  },
  backup: {
    maxBytes: fileLimitBytes('BACKUP_MAX_MB', 10240),
    dailyRetention: positiveLimit('BACKUP_DAILY_RETENTION', 7),
    weeklyRetention: positiveLimit('BACKUP_WEEKLY_RETENTION', 4),
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
