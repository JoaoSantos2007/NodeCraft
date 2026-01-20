import fs from 'fs';
import config from '../../config/index.js';
import Container from './Container.js';
import Instance from './Instance.js';

class Maintenance {
  static removeOldTemp() {
    try {
    // Verify if temporary path exists
      if (!fs.existsSync(config.temp.path)) return;

      // Read temporary path items
      const items = fs.readdirSync(config.temp.path);

      // Get timestamp
      const now = Date.now();

      for (const item of items) {
      // Verify if item name is a timestamp
        const createdAt = Number(item);
        if (Number.isInteger(createdAt) && createdAt > 0) {
          if (now - createdAt >= config.temp.lifetime) fs.rmSync(`${config.temp.path}/${item}`, { recursive: true, force: true });
        } else {
          fs.rmSync(`${config.temp.path}/${item}`, { recursive: true, force: true });
        }
      }
    } catch (err) {
    // Save error in logs
    }
  }

  static async ensureDefaultPaths() {
    try {
      if (!fs.existsSync(config.instance.path)) fs.mkdirSync(config.instance.path);
      if (!fs.existsSync(config.temp.path)) fs.mkdirSync(config.temp.path);
    } catch (err) {
      // Save err in log
    }
  }

  static async ensureDocker() {
    try {
      await Container.ensureImage('itzg/minecraft-server');
      await Container.ensureNetwork('nodecraft-net');

      Instance.attachAll();
    } catch (err) {
      // Save err in log
    }
  }

  static scheduleInstancesUpdate() {
    let lastRunDate = null;

    setInterval(async () => {
      try {
        // Read time
        const now = new Date();
        const isThreeAM = now.getHours() === 3;
        const today = now.toLocaleDateString('sv-SE');

        // Verify if is 3 hour and update was not executed today
        if (isThreeAM && lastRunDate !== today) {
          lastRunDate = today;

          // Update all instances function
          await Instance.updateAll();
        }
      } catch (err) {
        // Save error in log
      }
    }, config.interval.checkUpdate);
  }

  static scheduleInstancesBackup() {
    let lastRunDate = null;

    setInterval(async () => {
      try {
        // Read time
        const now = new Date();
        const isFiveAM = now.getHours() === 5;
        const today = now.toLocaleDateString('sv-SE');

        // Verify if is 5 hour and backup was not executed today
        if (isFiveAM && lastRunDate !== today) {
          lastRunDate = today;

          // Backup all instances function
          await Instance.backupAll();
        }
      } catch (err) {
        // Save error in log
      }
    }, config.interval.checkUpdate);
  }

  static scheduleRemoveOldTemp() {
    // First run
    Maintenance.removeOldTemp();

    // Set periodically
    setInterval(Maintenance.removeOldTemp, config.interval.checkTemp);
  }

  static scheduleRemoveLostInstances() {
    // First run
    Instance.verifyLost();

    // Set periodically
    setInterval(Instance.verifyLost, config.interval.checkLost);
  }

  static scheduleJobs() {
    Maintenance.scheduleInstancesUpdate();
    Maintenance.scheduleInstancesBackup();
    Maintenance.scheduleRemoveOldTemp();
    Maintenance.scheduleRemoveLostInstances();
  }
}

export default Maintenance;
