import { Op } from 'sequelize';
import {
  Worker as Model,
  WorkerHeartbeat as HeartbeatModel,
} from '../models/index.js';
import { NotFound } from '../errors/index.js';
import logger from '../../config/logger.js';
import { hashToken, generateRandomToken, compareToken } from '../utils/token.js';

const HEARTBEAT_RETENTION_DAYS = 7;
const HEARTBEAT_RETENTION_MS = HEARTBEAT_RETENTION_DAYS * 24 * 60 * 60 * 1000;
const DEAD_THRESHOLD = 3 * 60 * 1000; // 3 minutes
const CHECK_INTERVAL = 60 * 1000; // 1 minute
const PRUNE_INTERVAL = 60 * 60 * 1000; // 1 hour

const HEARTBEAT_RANGES = {
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '3d': 3 * 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
};

class Worker {
  static async create(data) {
    const apiKey = generateRandomToken();
    const secret = generateRandomToken();

    const created = await Model.create({
      name: data.name,
      apiKey: hashToken(apiKey),
      secret,
    });

    const worker = await Model.findByPk(created.id);

    return { worker, apiKey, secret };
  }

  static async readAll() {
    const workers = await Model.findAll();

    return workers;
  }

  static async readAvailableForUser(user) {
    const ids = Array.isArray(user?.allowedWorkers) ? user.allowedWorkers : [];
    if (ids.length === 0) return [];

    const workers = await Model.findAll({
      where: { id: { [Op.in]: ids } },
      attributes: [
        'id', 'name', 'url', 'healthy', 'lastSeenAt',
        'cpuUsage', 'memoryTotal', 'memoryUsed', 'diskAvailable',
      ],
    });

    return workers;
  }

  static async readOne(id) {
    const worker = await Model.findByPk(id);

    if (!worker) throw new NotFound('Worker not found!');

    return worker;
  }

  // Internal only. Every caller authenticates to the worker with secret
  static async readOneWithSecret(id) {
    const worker = await Model.scope('withSecret').findByPk(id);

    if (!worker) throw new NotFound('Worker not found!');

    return worker;
  }

  // Internal only, for workerAuth's hashed-apiKey comparison.
  static async readOneWithApiKey(id) {
    const worker = await Model.scope('withApiKey').findByPk(id);

    if (!worker) throw new NotFound('Worker not found!');

    return worker;
  }

  static async update(id, data) {
    const worker = await Worker.readOne(id);

    const changes = { ...data };
    if (typeof changes.secret !== 'string' || changes.secret.trim() === '') {
      delete changes.secret;
    }

    await worker.update(changes);

    return worker;
  }

  static async delete(id) {
    const worker = await Worker.readOne(id);
    await worker.destroy();

    return worker;
  }

  static readMemory(data) {
    return {
      memoryTotal: data.memoryTotal ?? data.memorieTotal,
      memoryUsed: data.memoryUsed ?? data.memorieUsed,
    };
  }

  static async receiveHeartbeat(id, data) {
    const info = {
      healthy: true,
      lastSeenAt: Date.now(),
      cpuUsage: data.cpuUsage,
      ...Worker.readMemory(data),
      diskAvailable: data.diskAvailable,
    };

    await Model.update(info, { where: { id } });

    await Worker.recordHeartbeat(id, data);
  }

  static async recordHeartbeat(id, data) {
    await HeartbeatModel.create({
      workerId: id,
      cpuUsage: data.cpuUsage,
      ...Worker.readMemory(data),
      diskAvailable: data.diskAvailable,
    });
  }

  static async pruneHeartbeats() {
    try {
      const cutoff = new Date(Date.now() - HEARTBEAT_RETENTION_MS);

      await HeartbeatModel.destroy({
        where: {
          createdAt: { [Op.lt]: cutoff },
        },
      });
    } catch (err) {
      logger.error({ err }, 'Error to prune old heartbeats!');
    }
  }

  static async readHeartbeats(id, range) {
    await Worker.readOne(id);

    const windowMs = HEARTBEAT_RANGES[range] || HEARTBEAT_RETENTION_MS;
    const cutoff = new Date(Date.now() - windowMs);

    const heartbeats = await HeartbeatModel.findAll({
      where: {
        workerId: id,
        createdAt: { [Op.gte]: cutoff },
      },
      order: [['createdAt', 'ASC']],
    });

    return heartbeats;
  }

  static compareApiKey(apiKey, storedApiKey) {
    return compareToken(apiKey, storedApiKey);
  }

  static startChecker() {
    setInterval(Worker.checkAll, CHECK_INTERVAL);
    setInterval(Worker.pruneHeartbeats, PRUNE_INTERVAL);

    Worker.checkAll();
    Worker.pruneHeartbeats();
  }

  static async checkAll() {
    try {
      const timeoff = Date.now() - DEAD_THRESHOLD;

      await Model.update(
        { healthy: false },
        {
          where: {
            healthy: true,
            lastSeenAt: { [Op.lt]: timeoff },
          },
        },
      );
    } catch (err) {
      logger.error({ err }, 'Error to verify dead worker!');
    }
  }
}

export default Worker;
