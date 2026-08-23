import app from './src/app.js';
import config from './config/config.js';
import BackupScheduler from './src/services/Backup.js';
import Worker from './src/services/Worker.js';
import logger from './config/logger.js';

app.listen(config.app.port, async () => {
  logger.info({ port: config.app.port }, 'Nodecraft API is running');

  Worker.startChecker();
  BackupScheduler.start();
});
