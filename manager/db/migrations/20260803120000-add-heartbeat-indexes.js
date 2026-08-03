'use strict';

/**
 * Indexes for the two statements that run on a timer and used to scan whole
 * tables, taking locks on every row they touched:
 *   - Worker.checkAll:        UPDATE worker ... WHERE healthy = ? AND lastSeenAt < ?
 *   - Worker.pruneHeartbeats: DELETE FROM worker_heartbeat WHERE createdAt < ?
 *
 * The existing worker_heartbeat (workerId, createdAt) index does not serve a
 * prune across all workers, since createdAt is not the leading column.
 *
 * @type {import('sequelize-cli').Migration}
 */
const ensureIndex = async (queryInterface, table, fields, name) => {
  const indexes = await queryInterface.showIndex(table);
  if (indexes.some((index) => index.name === name)) return;

  await queryInterface.addIndex(table, fields, { name });
};

const dropIndex = async (queryInterface, table, name) => {
  const indexes = await queryInterface.showIndex(table);
  if (!indexes.some((index) => index.name === name)) return;

  await queryInterface.removeIndex(table, name);
};

module.exports = {
  async up(queryInterface) {
    await ensureIndex(
      queryInterface,
      'worker',
      ['healthy', 'lastSeenAt'],
      'worker_healthy_last_seen_at',
    );

    await ensureIndex(
      queryInterface,
      'worker_heartbeat',
      ['createdAt'],
      'worker_heartbeat_created_at',
    );
  },

  async down(queryInterface) {
    await dropIndex(queryInterface, 'worker_heartbeat', 'worker_heartbeat_created_at');
    await dropIndex(queryInterface, 'worker', 'worker_healthy_last_seen_at');
  },
};
