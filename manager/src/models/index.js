import User from './User.js';
import Instance from './Instance.js';
import Link from './Link.js';
import Worker from './Worker.js';
import WorkerHeartbeat from './WorkerHeartbeat.js';
import db from '../../config/sequelize.js';
import config from '../../config/config.js';
import Minecraft from './Minecraft.js';
import Kerbal from './Kerbal.js';
import Hytale from './Hytale.js';
import Terraria from './Terraria.js';
import Roster from './Roster.js';

// instance <-> link
Instance.hasMany(Link, {
  foreignKey: 'instanceId',
  as: 'links',
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
  onDelete: 'CASCADE',
  hooks: true,
});

Link.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// user <-> instance
User.hasMany(Instance, {
  foreignKey: 'ownerId',
  as: 'ownedInstances',
  onDelete: 'CASCADE',
  hooks: true,
});

Instance.belongsTo(User, {
  foreignKey: 'ownerId',
  as: 'ownerUser',
});

// worker <-> instance
Worker.hasMany(Instance, {
  foreignKey: 'workerId',
  as: 'instances',
  onDelete: 'SET NULL',
  hooks: true,
});

Instance.belongsTo(Worker, {
  foreignKey: 'workerId',
  as: 'worker',
});

// worker <-> heartbeat
Worker.hasMany(WorkerHeartbeat, {
  foreignKey: 'workerId',
  as: 'heartbeats',
  onDelete: 'CASCADE',
  hooks: true,
});

WorkerHeartbeat.belongsTo(Worker, {
  foreignKey: 'workerId',
  as: 'worker',
});

// instance <--> minecraft
Instance.hasOne(Minecraft, {
  foreignKey: 'instanceId',
  as: 'minecraft',
  onDelete: 'CASCADE',
  hooks: true,
});

Minecraft.belongsTo(Instance, {
  foreignKey: 'instanceId',
});

// instance <--> ksp
Instance.hasOne(Kerbal, {
  foreignKey: 'instanceId',
  as: 'kerbal',
  onDelete: 'CASCADE',
  hooks: true,
});

Kerbal.belongsTo(Instance, {
  foreignKey: 'instanceId',
});

// instance <--> hytale
Instance.hasOne(Hytale, {
  foreignKey: 'instanceId',
  as: 'hytale',
  onDelete: 'CASCADE',
  hooks: true,
});

Hytale.belongsTo(Instance, {
  foreignKey: 'instanceId',
});

// instance <--> terraria
Instance.hasOne(Terraria, {
  foreignKey: 'instanceId',
  as: 'terraria',
  onDelete: 'CASCADE',
  hooks: true,
});

Terraria.belongsTo(Instance, {
  foreignKey: 'instanceId',
});

// instance <-> roster
Instance.hasMany(Roster, {
  foreignKey: 'instanceId',
  as: 'roster',
  onDelete: 'CASCADE',
  hooks: true,
});

Roster.belongsTo(Instance, {
  foreignKey: 'instanceId',
  as: 'instance',
});

// The one place a game name is bound to its model. config.instance.games holds
// the names (validators and Joi schemas read it); this holds the models.
const gameModels = {
  minecraft: Minecraft,
  kerbal: Kerbal,
  hytale: Hytale,
  terraria: Terraria,
};

// Fail at boot if models games are different from config games
const registered = Object.keys(gameModels).sort();
const configured = [...config.instance.games].sort();

if (registered.join() !== configured.join()) {
  throw new Error(
    `gameModels and config.instance.games disagree: [${registered}] vs [${configured}]`,
  );
}

// Define instances query include
const instanceInclude = [
  ...Object.entries(gameModels).map(([as, model]) => ({ model, as, required: false })),
  {
    model: Worker,
    as: 'worker',
    required: false,
    attributes: ['id', 'name', 'url', 'healthy'],
  },
  {
    model: Link,
    as: 'links',
    include: {
      model: User,
      as: 'user',
      required: false,
      attributes: ['id', 'name', 'email'],
    },
  },
  {
    model: Roster,
    as: 'roster',
    required: false,
  },
];

export {
  db,
  gameModels,
  instanceInclude,
  User,
  Instance,
  Link,
  Worker,
  WorkerHeartbeat,
  Roster,
};
