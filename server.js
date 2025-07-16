import app from './src/app.js';
import { PORT } from './config/settings.js';
import StartUp from './src/services/StartUp.js';

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Run instances on Startup
  StartUp.restartInstances();

  // Update instances every 3 hours
  StartUp.scheduleUpdates();
});
