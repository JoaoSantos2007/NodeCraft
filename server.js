import app from './src/app.js';
import { PORT } from './config/settings.js';
import { scheduleUpdates, restartInstances } from './src/utils/onStart.js';

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Run instances on Startup
  restartInstances();

  // Update instances every 3 hours
  scheduleUpdates();
});
