import User from './User.js';
import Instance from './Instance.js';
import Link from './Link.js';
import db from '../../config/sequelize.js';

// instance <-> link
Instance.hasMany(Link, {
  foreignKey: 'instanceId',
  as: 'players',
});

Link.belongsTo(Instance, {
  foreignKey: 'instanceId',
  as: 'instance',
  onDelete: 'CASCADE',
});

// user <-> link
User.hasMany(Link, {
  foreignKey: 'userId',
  as: 'instances',
});

Link.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  constraints: false, // userId pode ser arbitrário
});

// user <-> instance
User.hasMany(Instance, {
  foreignKey: 'owner',
  as: 'ownedInstances',
});

Instance.belongsTo(User, {
  foreignKey: 'owner',
  as: 'ownerUser',
  onDelete: 'CASCADE',
});

// await db.sync({ alter: true });
await db.query('PRAGMA foreign_keys = ON');

export {
  db,
  User,
  Instance,
  Link,
};
