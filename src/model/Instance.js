import { Sequelize, Model, DataTypes } from 'sequelize';
import db from '../config/sequelize.js';

class Instance extends Model {}

Instance.init({
  id: {
    type: Sequelize.UUIDV4,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gamemode: {
    type: DataTypes.STRING,
    values: ['survival', 'creative', 'adventure'],
    defaultValue: 'survival',
  },
  forceGamemode: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  difficulty: {
    type: DataTypes.STRING,
    values: ['peaceful', 'easy', 'normal', 'hard'],
    defaultValue: 'normal',
  },
  allowCheats: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  maxPlayers: {
    type: DataTypes.INTEGER,
    defaultValue: 6,
    validate: {
      min: 1,
    },
  },
  enableAllowList: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  serverPort: {
    type: DataTypes.INTEGER,
    defaultValue: 19132,
    validate: {
      min: 1,
      max: 65535,
    },
  },
  serverPortV6: {
    type: DataTypes.INTEGER,
    defaultValue: 19133,
    validate: {
      min: 1,
      max: 65535,
    },
  },
  enableLan: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  viewDistance: {
    type: DataTypes.INTEGER,
    defaultValue: 32,
    validate: {
      min: 5,
    },
  },
  tickDistance: {
    type: DataTypes.INTEGER,
    defaultValue: 4,
    validate: {
      min: 4,
      max: 12,
    },
  },
  playerIdleTimeout: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  maxThreads: {
    type: DataTypes.INTEGER,
    defaultValue: 8,
    validate: {
      min: 0,
    },
  },
  defaultPlayerPermissionLevel: {
    type: DataTypes.STRING,
    values: ['visitor', 'member', 'operator'],
    defaultValue: 'member',
  },
  texturepackRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  contentLogFileEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  compressionThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 0,
      max: 65535,
    },
  },
  compressionAlgorithm: {
    type: DataTypes.STRING,
    values: ['zlib', 'snappy'],
    defaultValue: 'zlib',
  },
  serverAuthoritativeMovement: {
    type: DataTypes.STRING,
    values: ['client-auth', 'server-auth', 'server-auth-with-rewind'],
    defaultValue: 'server-auth',
  },
  playerMovementScoreThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 20,
    validate: {
      min: 0,
    },
  },
  playerMovementActionDirectionThreshold: {
    type: DataTypes.DOUBLE,
    defaultValue: 0.85,
    validate: {
      min: 0,
      max: 1,
    },
  },
  playerMovementDistanceThreshold: {
    type: DataTypes.DOUBLE,
    defaultValue: 0.3,
    validate: {
      min: 0,
    },
  },
  playerMovementDurationThresholdInMs: {
    type: DataTypes.INTEGER,
    defaultValue: 500,
    validate: {
      min: 0,
    },
  },
  correctPlayerMovement: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  serverAuthoritativeBlockBreaking: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  chatRestriction: {
    type: DataTypes.STRING,
    values: ['None', 'Dropped', 'Disabled'],
    defaultValue: 'None',
  },
  disablePlayerInteraction: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  clientSideChunkGenerationEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  blockNetworkIdsAreHashes: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  disablePersona: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  disableCustomSkins: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'Instance',
  sequelize: db,
  timestamps: false,
});

await Instance.sync({ alter: true });

export default Instance;
