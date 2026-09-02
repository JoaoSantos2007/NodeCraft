'use strict';

/**
 * Adds instance.backupRequestedAt: when the scheduler last *asked* a worker to
 * back this instance up.
 *
 * lastBackupAt only lands when the worker reports back, and the worker's backup
 * endpoint is fire-and-forget — so between the request and the report the
 * scheduler had no record that the instance was already taken care of. With a
 * tick every 15min, the 3am hour fires four times and re-triggered every backup
 * that had not finished yet (and every 'skipped' one, which never stamps
 * lastBackupAt at all).
 *
 * Kept separate from lastBackupAt on purpose: that column still means "last
 * backup that completed", which is what the panel shows.
 *
 * @type {import('sequelize-cli').Migration}
 */
const ensureColumn = async (queryInterface, table, column, spec) => {
  const description = await queryInterface.describeTable(table);
  if (!description[column]) {
    await queryInterface.addColumn(table, column, spec);
  }
};

// Same SQLite caveat as the renames in 20260830120100/120200:
// queryInterface.removeColumn rebuilds the table, and rebuilding `instance`
// while link/roster/minecraft/kerbal/hytale/terraria reference it fails and
// leaves an `instance_backup` table behind. Raw DROP COLUMN (SQLite 3.35+)
// drops in place instead.
const dropColumn = async (queryInterface, table, column) => {
  const description = await queryInterface.describeTable(table);
  if (!description[column]) return;

  if (queryInterface.sequelize.getDialect() === 'sqlite') {
    await queryInterface.sequelize.query(
      `ALTER TABLE \`${table}\` DROP COLUMN \`${column}\``,
    );
    return;
  }

  await queryInterface.removeColumn(table, column);
};

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await ensureColumn(queryInterface, 'instance', 'backupRequestedAt', {
      type: DataTypes.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await dropColumn(queryInterface, 'instance', 'backupRequestedAt');
  },
};
