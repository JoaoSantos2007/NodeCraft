require('dotenv').config();

const databaseConfig = process.env.DATABASE_ENABLE === 'true'
  ? {
    dialect: 'mysql',
    host: process.env.DATABASE_HOST,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    logging: false,
  }
  : {
    dialect: 'sqlite',
    storage: './db.sqlite',
    logging: false,
    dialectOptions: {
      foreignKeys: true,
    },
  };

// sequelize-cli requires the env key it is invoked with to exist, so all three
// point at the same object: NODE_ENV/--env cannot select a different database
// than the one the API is talking to. Without this, a `db:migrate` run without
// NODE_ENV=production silently migrated a local SQLite file and left MySQL
// untouched.
module.exports = {
  development: databaseConfig,
  test: databaseConfig,
  production: databaseConfig,
};
