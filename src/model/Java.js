import { Sequelize, Model, DataTypes } from 'sequelize';
import db from '../config/sequelize.js';

class Java extends Model {}

Java.init({
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
  allowFlight: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('allowFlight field must be false or true');
      },
    },
  },
  allowNether: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('allowNether field must be false or true');
      },
    },
  },
  broadcastConsoleToOps: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('broadcastConsoleToOps field must be false or true');
      },
    },
  },
  broadcastRconToOps: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('broadcastRconToOps field must be false or true');
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
  enableCommandBlock: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('enableCommandBlock field must be false or true');
      },
    },
  },
  enableJmxMonitoring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('enableJmxMonitoring field must be false or true');
      },
    },
  },
  enableQuery: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('enableQuery field must be false or true');
      },
    },
  },
  enableRcon: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('enableRcon field must be false or true');
      },
    },
  },
  enableStatus: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('enableStatus field must be false or true');
      },
    },
  },
  enforceSecureProfile: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('enforceSecureProfile field must be false or true');
      },
    },
  },
  enforceWhitelist: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('enforceWhitelist field must be false or true');
      },
    },
  },
  entityBroadcastRangePercentage: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    allowNull: false,
    validate: {
      min: { args: [10], msg: 'entityBroadcastRangePercentage field must be a integer between 10 and 1000' },
      max: { args: [1000], msg: 'entityBroadcastRangePercentage field must be a integer between 10 and 1000' },
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
  functionPermissionLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 2,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'functionPermissionLevel field must be a integer between 1 and 4' },
      max: { args: [4], msg: 'functionPermissionLevel field must be a integer between 1 and 4' },
    },
  },
  gamemode: {
    type: DataTypes.STRING,
    values: ['survival', 'creative', 'adventure', 'spectator'],
    defaultValue: 'survival',
    allowNull: false,
    validate: {
      isIn: { args: [['survival', 'creative', 'adventure', 'spectator']], msg: 'gamemode field must be survival, creative, adventure or spectator' },
    },
  },
  generateStructures: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('generateStructures field must be false or true');
      },
    },
  },
  hardcore: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('hardcore field must be false or true');
      },
    },
  },
  hideOnlinePlayers: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('hideOnlinePlayers field must be false or true');
      },
    },
  },
  initialDisabledPacks: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  initialEnabledPacks: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'vanilla',
  },
  levelSeed: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  levelType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'minecraft:normal',
    values: ['minecraft:normal', 'minecraft:flat', 'minecraft:large_biomes', 'minecraft:amplified', 'minecraft:single_biome_surface'],
    validate: {
      isIn: { args: [['minecraft:normal', 'minecraft:flat', 'minecraft:large_biomes', 'minecraft:amplified', 'minecraft:single_biome_surface']], msg: 'levelType field must be minecraft:normal, minecraft:flat, minecraft:large_biomes, minecraft:amplified, minecraft:single_biome_surface' },
    },
  },
  logIps: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('logIps field must be false or true');
      },
    },
  },
  maxChainedNeighborUpdates: {
    type: DataTypes.INTEGER,
    defaultValue: 1000000,
    allowNull: false,
    validate: {
      isInt: 'maxChainedNeighborUpdates field must be a integer',
    },
  },
  maxPlayers: {
    type: DataTypes.INTEGER,
    defaultValue: 20,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'maxPlayers field must be a integer greater or equal to 1' },
    },
  },
  maxTickTime: {
    type: DataTypes.INTEGER,
    defaultValue: 60000,
    allowNull: false,
    validate: {
      min: { args: [-1], msg: 'maxTickTime field must be a integer greater or equal to -1' },
    },
  },
  maxWorldSize: {
    type: DataTypes.INTEGER,
    defaultValue: 29999984,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'maxWorldSize field must be a integer between 1 and 29999984' },
      max: { args: [29999984], msg: 'maxWorldSize field must be a integer between 1 and 29999984' },
    },
  },
  motd: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'A Minecraft Server',
    validate: {
      isAlphanumeric: { msg: 'name field must be a string' },
      len: { args: [1, 59], msg: 'name length is not between 1 and 59' },
    },
  },
  networkCompressionThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 256,
    allowNull: false,
    validate: {
      min: { args: [-1], msg: 'networkCompressionThreshold field must be a integer greater or equal to -1' },
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
  opPermissionLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 4,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'opPermissionLevel field must be a integer between 0 and 4' },
      max: { args: [4], msg: 'opPermissionLevel field must be a integer between 0 and 4' },
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
  preventProxyConnections: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('preventProxyConnections field must be false or true');
      },
    },
  },
  pvp: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('pvp field must be false or true');
      },
    },
  },
  queryPort: {
    type: DataTypes.INTEGER,
    defaultValue: 25565,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'queryPort field must be between 1 and 65535' },
      max: { args: [65535], msg: 'queryPort field must be between 1 and 65535' },
    },
  },
  rateLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'rateLimit field must be greater or equal to 0' },
    },
  },
  rconPassword: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  rconPort: {
    type: DataTypes.INTEGER,
    defaultValue: 25575,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'rconPort field must be between 1 and 65535' },
      max: { args: [65535], msg: 'rconPort field must be between 1 and 65535' },
    },
  },
  requireResourcePack: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('prequireResourcePackvp field must be false or true');
      },
    },
  },
  resourcePack: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resourcePackPrompt: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resourcePackSha1: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  serverIp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  serverPort: {
    type: DataTypes.INTEGER,
    defaultValue: 25565,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'serverPort field must be between 1 and 65535' },
      max: { args: [65535], msg: 'serverPort field must be between 1 and 65535' },
    },
  },
  simulationDistance: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    allowNull: false,
    validate: {
      min: { args: [3], msg: 'simulationDistance field must be between 3 and 32' },
      max: { args: [32], msg: 'simulationDistance field must be between 3 and 32' },
    },
  },
  spawnAnimals: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('spawnAnimals field must be false or true');
      },
    },
  },
  spawnMonsters: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('spawnMonsters field must be false or true');
      },
    },
  },
  spawnNpcs: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('spawnNpcs field must be false or true');
      },
    },
  },
  spawnProtection: {
    type: DataTypes.INTEGER,
    defaultValue: 16,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'spawnProtection field must be greater or equal to 0' },
    },
  },
  syncChunkWrites: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('syncChunkWrites field must be false or true');
      },
    },
  },
  useNativeTransport: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('useNativeTransport field must be false or true');
      },
    },
  },
  viewDistance: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    allowNull: false,
    validate: {
      min: { args: [3], msg: 'viewDistance field must be between 3 and 32' },
      max: { args: [32], msg: 'viewDistance field must be between 3 and 32' },
    },
  },
  whiteList: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate: {
      isBoolean(val) {
        if (typeof (val) === 'boolean') return true;
        throw new Error('whiteList field must be false or true');
      },
    },
  },
}, {
  tableName: 'Java',
  sequelize: db,
  timestamps: false,
});
