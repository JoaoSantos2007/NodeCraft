import { S3Client } from '@aws-sdk/client-s3';
import config from './index.js';

const s3Client = new S3Client({
  region: config.storage.region,
  endpoint: config.storage.endpoint || undefined,
  forcePathStyle: config.storage.forcePathStyle === 'true',
  credentials: {
    accessKeyId: config.storage.accessKeyId,
    secretAccessKey: config.storage.secretAccessKey,
  },
});

export default s3Client;
