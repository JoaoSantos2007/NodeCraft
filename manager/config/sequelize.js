import { Sequelize } from 'sequelize';
import config from './config.js';
import logger from './logger.js';

const databaseConfig = config.database;
let sequelizeConfig;

if (databaseConfig.enable) {
  sequelizeConfig = {
    dialect: 'mysql',
    host: databaseConfig.host,
    username: databaseConfig.username,
    password: databaseConfig.password,
    database: databaseConfig.name,
    logging: false,
    pool: {
      max: databaseConfig.poolMax,
      min: 0,
      acquire: databaseConfig.poolAcquire,
      idle: 10000,
    },
    dialectOptions: {
      connectTimeout: 10000,
    },
    hooks: {
      afterConnect: async (connection) => {
        await connection.promise().query(
          `SET SESSION innodb_lock_wait_timeout = ${databaseConfig.lockWaitTimeout}`,
        );
      },
    },
  };
} else {
  sequelizeConfig = {
    dialect: 'sqlite',
    storage: './db.sqlite',
    logging: false,
    dialectOptions: {
      foreignKeys: true,
    },
  };
}

const target = databaseConfig.enable
  ? `mysql ${sequelizeConfig.host}/${sequelizeConfig.database}`
  : `sqlite ${sequelizeConfig.storage}`;

const db = new Sequelize(sequelizeConfig);

try {
  await db.authenticate();

  logger.info({ target }, 'Connected to database');
} catch (err) {
  logger.error({ err, target }, 'Unable to connect to the database');
}

export default db;
