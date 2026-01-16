import Instance from '../services/Instance.js';
import Container from '../services/Container.js';
import { removeOldTemp } from './temp.js';
import config from '../../config/index.js';

// Execute some functions on start-up
const onStart = async () => {
  try {
    await Container.ensureImage('itzg/minecraft-server');
    await Container.ensureNetwork('nodecraft-net');

    Instance.attachAll();
  } catch {
    // Throw error
  }
};

// Update instances on 3 hour
const scheduleUpdates = () => {
  let lastRunDate = null;

  setInterval(async () => {
    // Read time
    const now = new Date();
    const isThreeAM = now.getHours() === 3;
    const today = now.toLocaleDateString('sv-SE');

    // Verify if is 3 hour and update was not executed today
    if (isThreeAM && lastRunDate !== today) {
      lastRunDate = today;

      // Update all instances function
      await Instance.updateAll();
      await Instance.backupAll();
    }
  }, config.interval.checkUpdate);
};

// Remove old temp paths
const scheduleTemp = () => {
  // First run
  removeOldTemp();

  // Set periodically
  setInterval(removeOldTemp, config.interval.checkTemp);
};

// Remove instances without registry in database
const scheduleLost = () => {
  // First run
  Instance.verifyLost();

  // Set periodically
  setInterval(Instance.verifyLost, config.interval.checkLost);
};

export {
  onStart,
  scheduleUpdates,
  scheduleTemp,
  scheduleLost,
};
