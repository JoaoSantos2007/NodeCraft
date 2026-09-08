'use strict';

/**
 * Counter-Strike 2 was dropped as a supported game: the model, the Joi schema
 * and the entry in `gameModels` are gone, so the `counterstrike` table can no
 * longer be reached by any code path.
 *
 * Two things are cleaned up here:
 *   - the `counterstrike` table itself;
 *   - the leftover `'counterstrike'` entry inside `user.allowedGames`, which
 *     would otherwise keep granting an entitlement for a game that can no
 *     longer be created (the model default no longer includes it).
 *
 * Instances of type `counterstrike` are NOT touched: prod has none, and
 * deleting instance rows from a migration is not something to do blindly. If
 * any ever show up, they must be removed deliberately through the API so the
 * worker also tears the container down.
 *
 * allowedGames is JSON, and neither SQLite nor MySQL gives a portable way to
 * remove one element from a JSON array in place, so the rows are read, filtered
 * in JS and written back one by one. MySQL returns JSON already parsed while
 * SQLite hands back the raw TEXT, hence the parse guard.
 *
 * @type {import('sequelize-cli').Migration}
 */
const REMOVED_GAME = 'counterstrike';

const tableExists = async (queryInterface, table) => {
  const tables = await queryInterface.showAllTables();

  return tables.some((name) => String(name).toLowerCase() === table);
};

const parseGames = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return null;

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const rewriteAllowedGames = async (queryInterface, map) => {
  const [rows] = await queryInterface.sequelize.query(
    'SELECT id, allowedGames FROM user',
  );

  for (const row of rows) {
    const games = parseGames(row.allowedGames);
    if (!games) continue;

    const next = map(games);
    if (next.length === games.length) continue;

    await queryInterface.bulkUpdate(
      'user',
      { allowedGames: JSON.stringify(next) },
      { id: row.id },
    );
  }
};

module.exports = {
  async up(queryInterface) {
    if (await tableExists(queryInterface, REMOVED_GAME)) {
      await queryInterface.dropTable(REMOVED_GAME);
    }

    await rewriteAllowedGames(
      queryInterface,
      (games) => games.filter((game) => game !== REMOVED_GAME),
    );
  },

  async down(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    if (!await tableExists(queryInterface, REMOVED_GAME)) {
      // Mirrors 20260511000006-create-counterstrike.
      await queryInterface.createTable(REMOVED_GAME, {
        instanceId: {
          type: DataTypes.UUID,
          primaryKey: true,
          allowNull: false,
          references: {
            model: 'instance',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        steamToken: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        servername: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'A Nodecraft Counter Strike 2 server',
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: '',
        },
        rconPassword: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'nodecraft',
        },
        mode: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'casual',
        },
        map: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'dust2',
        },
        botDifficulty: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        botQuota: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 10,
        },
        botMode: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'fill',
        },
      });
    }

    // The data that was filtered out cannot be recovered, so the entitlement is
    // handed back to every user that does not already have it.
    await rewriteAllowedGames(
      queryInterface,
      (games) => (games.includes(REMOVED_GAME) ? games : [...games, REMOVED_GAME]),
    );
  },
};
