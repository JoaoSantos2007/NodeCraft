import app from './src/app.js';
import { PORT } from './config/settings.js';
import {
  onStart,
  scheduleUpdates,
  scheduleTemp,
  scheduleLost,
} from './src/utils/scheduleJobs.js';

app.listen(PORT, () => {
  onStart();
  scheduleUpdates();
  scheduleTemp();
  scheduleLost();
});
