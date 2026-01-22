import fs from 'fs';
import config from '../../config/index.js';
import Container from './Container.js';
import Instance from './Instance.js';
import logger from '../../config/logger.js';

class Maintenance {
  static async ensureDefaultPaths() {
    try {
      if (!fs.existsSync(config.instance.path)) fs.mkdirSync(config.instance.path);
      if (!fs.existsSync(config.temp.path)) fs.mkdirSync(config.temp.path);
    } catch (err) {
      logger.error({ err }, 'Error to ensure default paths');
    }
  }

  static async ensureDocker() {
    try {
      await Container.ensureImage('itzg/minecraft-server');
      await Container.ensureNetwork('nodecraft-net');

      await Instance.attachAll();
    } catch (err) {
      logger.error({ err }, 'Error to ensure docker and instances');
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
        logger.error({ err }, 'Error to update all instances');
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
        logger.error({ err }, 'Error to backup all instances');
      }
    }, config.interval.checkUpdate);
  }

  static scheduleRemoveOldTemp() {
    const removeOldTemp = () => {
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
        logger.error({ err }, 'Error to remove old temp paths');
      }
    };

    // First run
    removeOldTemp();

    // Set periodically
    setInterval(removeOldTemp, config.interval.checkTemp);
  }

  static scheduleRemoveLostInstances() {
    // First run
    Instance.verifyLost();

    // Set periodically
    setInterval(Instance.verifyLost, config.interval.checkLost);
  }

  static scheduleRemoveLostContainers() {
    // First run
    Container.removeLostContainers();

    // Set periodically
    setInterval(Container.removeLostContainers, config.interval.checkLost);
  }

  static scheduleJobs() {
    try {
      Maintenance.scheduleInstancesUpdate();
      Maintenance.scheduleInstancesBackup();
      Maintenance.scheduleRemoveOldTemp();
      Maintenance.scheduleRemoveLostInstances();
      Maintenance.scheduleRemoveLostContainers();
    } catch (err) {
      logger.error({ err }, 'Error to schedule instances jobs');
    }
  }
}

export default Maintenance;
