import { Sequelize } from 'sequelize';

const db = new Sequelize({
  dialect: 'sqlite',
  storage: './db.sqlite',
  logging: false,
});

try {
  await db.authenticate();
  // eslint-disable-next-line no-console
  console.log('Connected to Database!');
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('Unable to connect to the database: ', err);
}

export default db;
