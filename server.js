import app from './src/app.js';
import config from './config/index.js';
import Maintenance from './src/services/Maintenance.js';

app.listen(config.app.port, () => {
  Maintenance.ensureDefaultPaths();
  Maintenance.ensureDocker();
  Maintenance.scheduleJobs();
});
