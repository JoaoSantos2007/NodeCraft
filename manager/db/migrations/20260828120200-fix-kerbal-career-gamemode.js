'use strict';

/**
 * KSP's gamemode is `CAREER`; the enum was misspelled `CARRER` everywhere since
 * the model was written (see worker/src/templates/kerbal/Settings.txt, which
 * always had the correct spelling). The model, the Joi schema and the Swagger
 * enum were fixed, so stored rows have to be rewritten too.
 *
 * Without this backfill a row still holding `CARRER` fails the model's `isIn`
 * on EVERY save of that instance's config — Sequelize validates all attributes
 * on save, not just the ones that changed — so an unrelated edit (difficulty,
 * servername) would start failing.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkUpdate(
      'kerbal',
      { gamemode: 'CAREER' },
      { gamemode: 'CARRER' },
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkUpdate(
      'kerbal',
      { gamemode: 'CARRER' },
      { gamemode: 'CAREER' },
    );
  },
};
