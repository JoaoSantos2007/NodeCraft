import app from './src/app.js';
import config from './config/index.js';
import {
  onStart,
  scheduleUpdates,
  scheduleTemp,
  scheduleLost,
} from './src/utils/scheduleJobs.js';

app.listen(config.app.port, () => {
  onStart();
  scheduleUpdates();
  scheduleTemp();
  scheduleLost();
});
