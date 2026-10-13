import { Router, json } from 'express';
import Controller from '../controllers/Worker.js';
import {
  auth, workerAuth, workerOrAuth, validate,
} from '../middlewares/index.js';
import { createWorker, updateWorker } from '../schemas/index.js';

const router = Router();

// Mounted before the default JSON parser. Authenticate before accepting large reports.
const reports = Router();
reports.put(
  '/worker/:workerId/instances/:instanceId',
  workerAuth(),
  json({ limit: '9mb' }),
  Controller.updateInstance,
);

router
  .get(
    '/worker',
    auth('logged'),
    Controller.readAvailable,
  )
  .get(
    '/worker/all',
    auth('admin'),
    Controller.readAll,
  )
  .get(
    '/worker/:id',
    auth('admin'),
    Controller.readOne,
  )
  .get(
    '/worker/:id/heartbeats',
    auth('admin'),
    Controller.readHeartbeats,
  )
  .post(
    '/worker',
    auth('admin'),
    validate(createWorker),
    Controller.create,
  )
  .put(
    '/worker/:id',
    auth('admin'),
    validate(updateWorker),
    Controller.update,
  )
  .delete(
    '/worker/:id',
    auth('admin'),
    Controller.delete,
  )
  .post(
    '/worker/:id/heartbeat',
    workerAuth(),
    Controller.heartbeat,
  )
  .get(
    '/worker/:id/instances',
    workerOrAuth('admin'),
    Controller.readInstances,
  )
  .put(
    '/worker/:workerId/instances/:instanceId/backup',
    workerAuth(),
    Controller.reportBackupResult,
  )
  .post(
    '/worker/:workerId/instances/:instanceId/console-access',
    workerAuth(),
    Controller.consoleAccess,
  );

export { reports };
export default router;
