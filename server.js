import app from './src/app.js';
import { PORT } from './config/settings.js';
import { scheduleUpdates, attachInstances } from './src/utils/onStart.js';

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Attach or run instances on Startup
  attachInstances();

  // Update instances every 3 hours
  scheduleUpdates();
});
