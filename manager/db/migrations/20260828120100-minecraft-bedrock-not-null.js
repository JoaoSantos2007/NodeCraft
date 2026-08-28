'use strict';

/**
 * `Minecraft.bedrock` was the only nullable boolean in the codebase — every
 * other one is `allowNull: false`. The model was tightened to match, so the
 * column has to follow, otherwise a row that is NULL in prod starts failing the
 * notNull check on the next save of that instance's config.
 *
 * The backfill runs first: NULL means "Geyser was never enabled", which is
 * exactly the model default.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.bulkUpdate('minecraft', { bedrock: false }, { bedrock: null });

    await queryInterface.changeColumn('minecraft', 'bedrock', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.changeColumn('minecraft', 'bedrock', {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });
  },
};
