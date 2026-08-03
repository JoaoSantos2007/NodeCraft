import config from '../../config/config.js';
import Container from './Container.js';
import File from './File.js';
import logger from '../../config/logger.js';
import Server from './Server.js';
import Manager from './Manager.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 1 * 60 * 60 * 1000;

class Maintenance {
  static async createDefaultPaths() {
    try {
      await File.createOneDirectory(config.paths.instances);
      await File.createOneDirectory(config.paths.temp);
    } catch (err) {
      logger.error({ err }, 'Error to create default paths');
    }
  }

  static async checkDocker() {
    try {
      await Container.ensureNetwork('nodecraft-net');

      for (const [game, image] of Object.entries(config.images)) {
        try {
          await Container.ensureImage(image);
        } catch (err) {
          logger.error({ err }, `Error to ensure docker ${game} image`);
        }
      }
    } catch (err) {
      logger.error({ err }, 'Error to ensure docker');
    }
  }

  static async ensureEnviroment() {
    await Maintenance.createDefaultPaths();
    await Maintenance.checkDocker();
  }

  // Drops containers and files of instances the manager no longer hosts here.
  static async removeLostResources() {
    try {
      const instances = await Manager.getInstances();

      await Server.removeLost(instances);
      await Container.removeLost(instances);
    } catch (err) {
      logger.error({ err }, 'Skipping lost resources removal, could not read the instance list');
    }
  }

  static async cleanUp() {
    await Maintenance.removeLostResources();
    await File.removeOldTemp();

    // Set periodically
    setInterval(Maintenance.removeLostResources, ONE_HOUR);
    setInterval(File.removeOldTemp, FIFTEEN_MINUTES);
  }
}

export default Maintenance;
