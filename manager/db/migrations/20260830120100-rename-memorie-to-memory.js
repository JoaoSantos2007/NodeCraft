'use strict';

/**
 * `memorieTotal` / `memorieUsed` -> `memoryTotal` / `memoryUsed`.
 *
 * Pure rename, no semantic change: both stay integer megabytes. The columns
 * exist on `worker` (latest heartbeat snapshot) and `worker_heartbeat` (the
 * retained series).
 *
 * SQLite is renamed with raw `ALTER TABLE ... RENAME COLUMN` (3.25+) instead of
 * queryInterface.renameColumn, which rebuilds the whole table: the rebuild drops
 * and recreates `worker` while instance.workerId and worker_heartbeat.workerId
 * still point at it, so it aborts with a FOREIGN KEY failure and leaves a
 * worker_backup table behind. MySQL keeps queryInterface.renameColumn, which
 * emits CHANGE COLUMN and works on 5.7 as well as 8.
 *
 * Deploy note: these names are also the wire format of the worker -> manager
 * heartbeat body. Worker.receiveHeartbeat accepts the old keys as a fallback so
 * a manager on this migration keeps recording metrics from a worker that has
 * not been updated yet. Drop that fallback once every worker is on the new
 * build.
 *
 * @type {import('sequelize-cli').Migration}
 */
const RENAMES = [
  ['worker', 'memorieTotal', 'memoryTotal'],
  ['worker', 'memorieUsed', 'memoryUsed'],
  ['worker_heartbeat', 'memorieTotal', 'memoryTotal'],
  ['worker_heartbeat', 'memorieUsed', 'memoryUsed'],
];

const rename = async (queryInterface, table, from, to) => {
  const description = await queryInterface.describeTable(table);
  if (!description[from] || description[to]) return;

  if (queryInterface.sequelize.getDialect() === 'sqlite') {
    await queryInterface.sequelize.query(
      `ALTER TABLE \`${table}\` RENAME COLUMN \`${from}\` TO \`${to}\``,
    );
    return;
  }

  await queryInterface.renameColumn(table, from, to);
};

module.exports = {
  async up(queryInterface) {
    for (const [table, from, to] of RENAMES) {
      await rename(queryInterface, table, from, to);
    }
  },

  async down(queryInterface) {
    for (const [table, from, to] of RENAMES) {
      await rename(queryInterface, table, to, from);
    }
  },
};
