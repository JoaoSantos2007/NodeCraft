'use strict';

/**
 * Adds `createdAt` to the tables that never had one. Until now nothing recorded
 * when a user signed up, when an instance was created, when access was granted
 * or when a player was authorized — `worker_heartbeat` was the only table with
 * a timestamp, and it hand-rolled the column.
 *
 * The column is nullable on purpose. Existing rows genuinely have no known
 * creation time, and backfilling them with the migration date would invent data
 * that looks real; NULL says "before we tracked this". New rows get a value
 * from Sequelize (timestamps: true, updatedAt: false).
 *
 * `updatedAt` is deliberately not added: nothing reads it today, and it would
 * mean an extra write on every heartbeat-driven instance update.
 *
 * @type {import('sequelize-cli').Migration}
 */
const TABLES = ['user', 'instance', 'link', 'roster', 'worker'];

const ensureColumn = async (queryInterface, table, column, spec) => {
  const description = await queryInterface.describeTable(table);
  if (description[column]) return;

  await queryInterface.addColumn(table, column, spec);
};

// queryInterface.removeColumn rebuilds the table on SQLite, which fails while
// other tables hold foreign keys into it. SQLite 3.35+ drops in place.
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

    for (const table of TABLES) {
      await ensureColumn(queryInterface, table, 'createdAt', {
        type: DataTypes.DATE,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    for (const table of [...TABLES].reverse()) {
      await dropColumn(queryInterface, table, 'createdAt');
    }
  },
};
