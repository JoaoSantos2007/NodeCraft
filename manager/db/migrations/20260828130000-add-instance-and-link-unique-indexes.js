'use strict';

/**
 * Two invariants that were only ever enforced by a check-then-write in the
 * service layer, and so lost every race:
 *
 *   - link (instanceId, userId): Link.verifyUserIsAlreadyLinked reads before it
 *     writes, so two concurrent grants both pass. The duplicates are invisible
 *     until Link.readByUserAndInstance findOne's an arbitrary one of them and
 *     the user's permissions start depending on row order.
 *
 *   - instance (workerId, port): Instance.selectPort scans for a free port and
 *     then writes it, with the same race. There are only 51 ports per worker,
 *     so the window is not theoretical, and the result is two containers
 *     fighting over one port.
 *
 * The port index is scoped to the worker on purpose: a port is only unique per
 * machine, and two instances on different workers may both use 5621. NULL ports
 * (instances not yet placed on a worker) do not collide — MySQL and SQLite both
 * treat NULLs as distinct inside a unique index.
 *
 * Existing duplicates are reported instead of being deleted: which of two
 * conflicting rows to keep is a judgement call, not something a migration
 * should decide silently.
 *
 * @type {import('sequelize-cli').Migration}
 */
const INSTANCE_PORT_INDEX = 'instance_worker_id_port_unique';
const LINK_USER_INDEX = 'link_instance_id_user_id_unique';

const ensureIndex = async (queryInterface, table, fields, name) => {
  const indexes = await queryInterface.showIndex(table);
  if (indexes.some((index) => index.name === name)) return;

  await queryInterface.addIndex(table, fields, { name, unique: true });
};

const dropIndex = async (queryInterface, table, name) => {
  const indexes = await queryInterface.showIndex(table);
  if (!indexes.some((index) => index.name === name)) return;

  await queryInterface.removeIndex(table, name);
};

const assertNoDuplicates = async (queryInterface, table, columns, where = '') => {
  const list = columns.map((column) => `\`${column}\``).join(', ');
  const [rows] = await queryInterface.sequelize.query(
    `SELECT ${list}, COUNT(*) AS total FROM \`${table}\` ${where} `
    + `GROUP BY ${list} HAVING COUNT(*) > 1`,
  );

  if (rows.length === 0) return;

  const detail = rows
    .map((row) => `(${columns.map((column) => row[column]).join(', ')}) x${row.total}`)
    .join(', ');

  throw new Error(
    `Cannot add the unique index on ${table}(${columns.join(', ')}): `
    + `${rows.length} duplicate group(s) already exist — ${detail}. `
    + 'Resolve them by hand, then re-run this migration.',
  );
};

module.exports = {
  async up(queryInterface) {
    await assertNoDuplicates(queryInterface, 'link', ['instanceId', 'userId']);
    await assertNoDuplicates(
      queryInterface,
      'instance',
      ['workerId', 'port'],
      'WHERE port IS NOT NULL AND workerId IS NOT NULL',
    );

    await ensureIndex(queryInterface, 'link', ['instanceId', 'userId'], LINK_USER_INDEX);
    await ensureIndex(queryInterface, 'instance', ['workerId', 'port'], INSTANCE_PORT_INDEX);
  },

  async down(queryInterface) {
    await dropIndex(queryInterface, 'instance', INSTANCE_PORT_INDEX);
    await dropIndex(queryInterface, 'link', LINK_USER_INDEX);
  },
};
