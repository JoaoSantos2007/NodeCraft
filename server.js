import app from './src/app.js';
import { PORT } from './config/settings.js';
import Initialization from './src/services/Initialization.js';

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Run instances on Startup
  // Initialization.runInstances();

  // Update instances every 3 hours
  Initialization.scheduleUpdates();
});
