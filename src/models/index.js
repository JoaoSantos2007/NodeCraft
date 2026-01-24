import User from './User.js';
import Instance from './Instance.js';
import Link from './Link.js';
import db from '../../config/sequelize.js';
import Minecraft from './Minecraft.js';

// instance <-> link
Instance.hasMany(Link, {
  foreignKey: 'instanceId',
  as: 'players',
  onDelete: 'CASCADE',
  hooks: true,
});

Link.belongsTo(Instance, {
  foreignKey: 'instanceId',
  as: 'instance',
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
  onDelete: 'CASCADE',
  hooks: true,
});

Instance.belongsTo(User, {
  foreignKey: 'owner',
  as: 'ownerUser',
});

// instance <--> minecraft
Instance.hasOne(Minecraft, {
  foreignKey: 'instanceId',
  as: 'minecraft',
  onDelete: 'CASCADE',
});

Minecraft.belongsTo(Instance, {
  foreignKey: 'instanceId',
});

// await db.sync({ alter: true });
await db.query('PRAGMA foreign_keys = ON');

export {
  db,
  User,
  Instance,
  Link,
  Minecraft,
};
