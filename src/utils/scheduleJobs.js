import Instance from '../services/Instance.js';
import { TEMPORARY_MAX_AGE, UPDATE_TIME_CHECK } from '../../config/settings.js';
import { removeOldTemp } from './temp.js';

// Execute some functions on start-up
const onStart = () => {
  Instance.attachAll();
};

// Update instances on 3 hour
const scheduleUpdates = () => {
  let lastRunDate = null;

  setInterval(() => {
    // Read time
    const now = new Date();
    const isThreeAM = now.getHours() === 3;
    const today = now.toLocaleDateString('sv-SE');

    // Verify if is 3 hour and update was not executed today
    if (isThreeAM && lastRunDate !== today) {
      lastRunDate = today;

      // Update all instances function
      Instance.updateAll();
    }
  }, UPDATE_TIME_CHECK);
};

// Remove old temp paths
const scheduleTemp = () => {
  // First run
  removeOldTemp();

  // Set periodically
  setInterval(removeOldTemp, TEMPORARY_MAX_AGE);
};

const scheduleInstances = () => {

};

export {
  onStart,
  scheduleUpdates,
  scheduleTemp,
  scheduleInstances,
};
