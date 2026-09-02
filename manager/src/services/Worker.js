import { Op } from 'sequelize';
import {
  db,
  Worker as Model,
  WorkerHeartbeat as HeartbeatModel,
} from '../models/index.js';
import { NotFound } from '../errors/index.js';
import logger from '../../config/logger.js';
import { hashToken, generateRandomToken, compareToken } from '../utils/token.js';

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;

const HEARTBEAT_RETENTION_DAYS = 7;
const HEARTBEAT_RETENTION_MS = HEARTBEAT_RETENTION_DAYS * ONE_DAY;
const DEAD_THRESHOLD = 3 * ONE_MINUTE;
const CHECK_INTERVAL = ONE_MINUTE;
const PRUNE_INTERVAL = ONE_HOUR;

const DEFAULT_RANGE = '24h';

const HEARTBEAT_RANGES = {
  '1h': ONE_HOUR,
  '6h': 6 * ONE_HOUR,
  '24h': ONE_DAY,
  '3d': 3 * ONE_DAY,
  '7d': 7 * ONE_DAY,
};

// Same buckets the dashboard charts with.
const HEARTBEAT_BUCKETS = {
  '1h': ONE_MINUTE,
  '6h': 5 * ONE_MINUTE,
  '24h': 15 * ONE_MINUTE,
  '3d': ONE_HOUR,
  '7d': 2 * ONE_HOUR,
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

  static async receiveHeartbeat(id, data) {
    const metrics = {
      cpuUsage: data.cpuUsage,
      memoryTotal: data.memoryTotal,
      memoryUsed: data.memoryUsed,
      diskAvailable: data.diskAvailable,
    };

    // lastSeenAt is a BIGINT of epoch ms — checkAll compares it as a number.
    await Model.update(
      { healthy: true, lastSeenAt: Date.now(), ...metrics },
      { where: { id } },
    );

    await HeartbeatModel.create({ workerId: id, ...metrics });
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

    const key = HEARTBEAT_RANGES[range] ? range : DEFAULT_RANGE;
    const windowMs = HEARTBEAT_RANGES[key];
    const bucketMs = HEARTBEAT_BUCKETS[key];
    const cutoff = new Date(Date.now() - windowMs);

    // Heartbeats land every 15s, so a raw 7d window is ~40k rows for a chart
    // that draws ~84 points. Averaging per bucket here keeps the payload small;
    // the buckets match web/src/utils/metrics.js, which re-buckets the same way.
    // The division has to floor, or every distinct timestamp becomes its own
    // group and nothing is bucketed: sqlite's `/` is integer division on
    // integers, but MySQL's returns a decimal — it needs DIV.
    const bucketSeconds = bucketMs / ONE_SECOND;
    const bucket = db.literal(db.getDialect() === 'sqlite'
      ? `(CAST(strftime('%s', createdAt) AS INTEGER) / ${bucketSeconds})`
      : `(UNIX_TIMESTAMP(createdAt) DIV ${bucketSeconds})`);

    const rows = await HeartbeatModel.findAll({
      where: {
        workerId: id,
        createdAt: { [Op.gte]: cutoff },
      },
      attributes: [
        [db.fn('MIN', db.col('createdAt')), 'createdAt'],
        [db.fn('AVG', db.col('cpuUsage')), 'cpuUsage'],
        [db.fn('AVG', db.col('memoryTotal')), 'memoryTotal'],
        [db.fn('AVG', db.col('memoryUsed')), 'memoryUsed'],
        [db.fn('AVG', db.col('diskAvailable')), 'diskAvailable'],
      ],
      group: [bucket],
      order: [[db.fn('MIN', db.col('createdAt')), 'ASC']],
      raw: true,
    });

    // raw rows carry the driver's own shapes (a string on sqlite, a Date on
    // mysql) and AVG turns the MB columns into floats. Normalise both so the
    // response looks the same as it did row by row.
    return rows.map((row) => ({
      createdAt: new Date(row.createdAt).toISOString(),
      cpuUsage: row.cpuUsage,
      memoryTotal: row.memoryTotal === null ? null : Math.round(row.memoryTotal),
      memoryUsed: row.memoryUsed === null ? null : Math.round(row.memoryUsed),
      diskAvailable: row.diskAvailable === null ? null : Math.round(row.diskAvailable),
    }));
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
