import { Sequelize, Model, DataTypes } from 'sequelize';
import db from '../config/sequelize.js';

class Instance extends Model {}

Instance.init({
  id: {
    type: Sequelize.UUIDV4,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isAlphanumeric: { msg: 'name field must be a string' },
      len: { args: [4, 32], msg: 'name length is not between 4 and 32' },
    },
  },
  gamemode: {
    type: DataTypes.STRING,
    values: ['survival', 'creative', 'adventure'],
    defaultValue: 'survival',
    allowNull: false,
    validate: {
      isIn: { args: [['survival', 'creative', 'adventure']], msg: 'gamemode field must be survival, creative or adventure' },
    },
  },
  forceGamemode: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('forceGamemode field must be false or true');
      },
    },
  },
  difficulty: {
    type: DataTypes.STRING,
    values: ['peaceful', 'easy', 'normal', 'hard'],
    defaultValue: 'easy',
    allowNull: false,
    validate: {
      isIn: { args: [['peaceful', 'easy', 'normal', 'hard']], msg: 'difficulty field must be peaceful, easy, normal or hard' },
    },
  },
  allowCheats: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('allowCheats field must be false or true');
      },
    },
  },
  maxPlayers: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'maxPlayers field must be a integer greater or equal to 1' },
    },
  },
  onlineMode: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('onlineMode field must be false or true');
      },
    },
  },
  enableAllowList: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('enableAllowList field must be false or true');
      },
    },
  },
  serverPort: {
    type: DataTypes.INTEGER,
    defaultValue: 19132,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'serverPort field must be between 1 and 65535' },
      max: { args: [65535], msg: 'serverPort field must be between 1 and 65535' },
    },
  },
  serverPortV6: {
    type: DataTypes.INTEGER,
    defaultValue: 19133,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'serverPortV6 field must be between 1 and 65535' },
      max: { args: [65535], msg: 'serverPortV6 field must be between 1 and 65535' },
    },
  },
  enableLan: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('enableLan field must be false or true');
      },
    },
  },
  viewDistance: {
    type: DataTypes.INTEGER,
    defaultValue: 32,
    allowNull: false,
    validate: {
      min: { args: [5], msg: 'viewDistance field must be a integer greater or equal to 5' },
    },
  },
  tickDistance: {
    type: DataTypes.INTEGER,
    defaultValue: 4,
    allowNull: false,
    validate: {
      min: { args: [4], msg: 'tickDistance field must be a integer between 4 and 12' },
      max: { args: [12], msg: 'tickDistance field must be a integer between 4 and 12' },
    },
  },
  playerIdleTimeout: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'playerIdleTimeout field must be a integer greater or equal to 0' },
    },
  },
  maxThreads: {
    type: DataTypes.INTEGER,
    defaultValue: 8,
    allowNull: false,
    validate: {
      min: { args: [8], msg: 'maxThreads field must be a integer greater or equal to 8' },
    },
  },
  defaultPlayerPermissionLevel: {
    type: DataTypes.STRING,
    values: ['visitor', 'member', 'operator'],
    defaultValue: 'member',
    allowNull: false,
    validate: {
      isIn: { args: [['visitor', 'member', 'operator']], msg: 'defaultPlayerPermissionLevel field must be visitor, member or operator' },
    },
  },
  texturepackRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('texturepackRequired field must be false or true');
      },
    },
  },
  contentLogFileEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('contentLogFileEnabled field must be false or true');
      },
    },
  },
  compressionThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'compressionThreshold field must be a integer between 0 and 65535' },
      max: { args: [65535], msg: 'compressionThreshold field must be a integer between 0 and 65535' },
    },
  },
  compressionAlgorithm: {
    type: DataTypes.STRING,
    values: ['zlib', 'snappy'],
    defaultValue: 'zlib',
    allowNull: false,
    validate: {
      isIn: { args: [['zlib', 'snappy']], msg: 'compressionAlgorithm field must be zlib or snappy' },
    },
  },
  serverAuthoritativeMovement: {
    type: DataTypes.STRING,
    values: ['client-auth', 'server-auth', 'server-auth-with-rewind'],
    defaultValue: 'server-auth',
    allowNull: false,
    validate: {
      isIn: { args: [['client-auth', 'server-auth', 'server-auth-with-rewind']], msg: 'serverAuthoritativeMovement field must be client-auth, server-auth or server-auth-with-rewind' },
    },
  },
  playerMovementScoreThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 20,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'playerMovementScoreThreshold field must be a integer greater or equal to 0' },
    },
  },
  playerMovementActionDirectionThreshold: {
    type: DataTypes.DOUBLE,
    defaultValue: 0.85,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'playerMovementActionDirectionThreshold field must be a float between 0 and 1' },
      max: { args: [1], msg: 'playerMovementActionDirectionThreshold field must be a float between 0 and 1' },
    },
  },
  playerMovementDistanceThreshold: {
    type: DataTypes.DOUBLE,
    defaultValue: 0.3,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'playerMovementDistanceThreshold field must be a float greater or equal to 0' },
    },
  },
  playerMovementDurationThresholdInMs: {
    type: DataTypes.INTEGER,
    defaultValue: 500,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'playerMovementDurationThresholdInMs field must be a integer greater or equal to 0' },
    },
  },
  correctPlayerMovement: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('correctPlayerMovement field must be false or true');
      },
    },
  },
  serverAuthoritativeBlockBreaking: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('serverAuthoritativeBlockBreaking field must be false or true');
      },
    },
  },
  chatRestriction: {
    type: DataTypes.STRING,
    values: ['None', 'Dropped', 'Disabled'],
    defaultValue: 'None',
    allowNull: false,
    validate: {
      isIn: { args: [['None', 'Dropped', 'Disabled']], msg: 'chatRestriction field must be None, Dropped or Disabled' },
    },
  },
  disablePlayerInteraction: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('disablePlayerInteraction field must be false or true');
      },
    },
  },
  clientSideChunkGenerationEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('clientSideChunkGenerationEnabled field must be false or true');
      },
    },
  },
  blockNetworkIdsAreHashes: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('blockNetworkIdsAreHashes field must be false or true');
      },
    },
  },
  disablePersona: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('disablePersona field must be false or true');
      },
    },
  },
  disableCustomSkins: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('disableCustomSkins field must be false or true');
      },
    },
  },
}, {
  tableName: 'Instance',
  sequelize: db,
  timestamps: false,
});

await Instance.sync({ alter: true });

export default Instance;
