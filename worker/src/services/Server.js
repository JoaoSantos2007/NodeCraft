import Path from 'path';
import Container from './Container.js';
import Backup from './Backup.js';
import File from './File.js';
import { running, gameRuntimes } from '../runtimes/index.js';
import { Internal } from '../errors/index.js';
import logger from '../../config/logger.js';
import config from '../../config/config.js';
import Manager from './Manager.js';

// Instances with a backup in flight. The manager's backup endpoint is
// fire-and-forget, so a second request for the same instance would stop a
// container that is mid-backup and race the restart and the status report.
const backingUp = new Set();

class Server {
  static async run(instance) {
    try {
      const instancePath = `${config.paths.instances}/${instance.id}`;

      await File.createOneDirectory(instancePath);
      await Container.create(instance);

      const Runtime = gameRuntimes[instance.type];
      if (!Runtime) throw new Internal('Instace game runtime not found!');

      running[instance.id] = new Runtime(instance);
    } catch (err) {
      Server.stop(instance);
      logger.error({ err }, `Error to run instance ${instance?.id}`);
    }
  }

  static async stop(instance) {
    try {
      await Container.stop(instance.id);

      // Stop runtime instance
      if (running[instance.id]) running[instance.id].finish();
      await Container.delete(instance.id);
    } catch (err) {
      logger.error({ err }, `Error to stop instance ${instance?.id}`);
    }
  }

  static async restart(instance) {
    try {
      await Server.stop(instance);
      await Server.run(instance);
    } catch (err) {
      logger.error({ err }, `Error to restart instance ${instance?.id}`);
    }
  }

  static async backup(instance) {
    // Asked before anything else: a backup that was never going to run must not
    // cost the instance a stop/start, and the manager still needs the result.
    const skipReason = Backup.skipReason(instance);
    if (skipReason) {
      logger.info(`Skipping backup for instance ${instance.id}: ${skipReason}`);
      await Manager.reportBackupResult(instance.id, { status: 'skipped' });

      return;
    }

    if (backingUp.has(instance.id)) {
      logger.warn(`Backup for instance ${instance.id} is already running, ignoring the request`);

      return;
    }

    backingUp.add(instance.id);

    const isRunning = instance.status === 'running';
    let result = { status: 'failed' };

    try {
      if (isRunning) await Server.stop(instance);

      result = await Backup.execute(instance, true);
    } catch (err) {
      logger.error({ err }, `Error to backup instance ${instance?.id}`);
    } finally {
      // Always bring the instance back up if it was running, even if the backup failed
      if (isRunning) await Server.run(instance);
      await Manager.reportBackupResult(instance.id, result);

      backingUp.delete(instance.id);
    }
  }

  // Start instances that were running before worker shutdown
  static async wakeUp() {
    try {
      const instances = await Manager.getInstances();

      for (const instance of instances) {
        try {
          if (instance.status === 'running') {
            await Server.run(instance);
          }
        } catch (err) {
          logger.error({ err }, 'Error to wake up an instance');
        }
      }
    } catch (err) {
      logger.error({ err }, 'Error to wake up instances');
    }
  }

  static async removeLost(instances) {
    if (!Array.isArray(instances)) {
      logger.error('Refusing to mark lost instances without a valid instance list');

      return;
    }

    const instancesId = await File.readOneDirectory(config.paths.instances);
    if (!instancesId) return;

    if (instances.length === 0 && instancesId.length > 0) {
      logger.warn('Marking lost instances against an empty instance list');
    }

    // Instance lifetime as 5 days
    const INSTANCE_LIFETIME = 5 * 24 * 60 * 60 * 1000;

    for (const id of instancesId) {
      try {
        const instancePath = Path.join(config.paths.instances, id);
        const pendingDelete = Path.join(instancePath, '.delete.json');

        const existsPendingDelete = await File.verifyExists(pendingDelete);

        let instanceExists = false;
        for (const instance of instances) {
          if (id === instance.id) instanceExists = true;
        }

        // Verify if instances exists in database and delete pending process and return
        if (instanceExists) {
          await File.delete(pendingDelete);
          continue;
        }

        // Verify if pending delete process exists
        if (existsPendingDelete) {
          // Try to read .delete.json
          const rawData = await File.readOneFile(pendingDelete);
          const data = JSON.parse(rawData);

          const time = Number(data?.time);
          const now = Date.now();

          // An unreadable timestamp says nothing about how long the instance has
          // been lost: restart the grace period instead of deleting right away.
          if (!Number.isFinite(time) || time <= 0) {
            await File.createOneFile(pendingDelete, `{"time":${now}}`);
            continue;
          }

          if (now - time >= INSTANCE_LIFETIME) {
            // Delete pending instance
            await File.delete(instancePath);
          }
        } else {
          // Write .delete.json
          await File.createOneFile(pendingDelete, `{"time":${Date.now()}}`);
        }
      } catch (err) {
        logger.error({ err }, 'Error to verify lost instance');
        continue;
      }
    }
  }
}

export default Server;
