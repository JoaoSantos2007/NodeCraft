const Instance = {
  id: {
    type: 'string',
    internal: true,
  },
  pid: {
    type: 'string',
    internal: true,
  },
  owner: {
    type: 'string',
    internal: true,
  },
  name: {
    type: 'string',
    required: true,
    min: 3,
    max: 32,
  },
  type: {
    type: 'string',
    required: true,
    values: ['bedrock', 'java'],
    internal: true,
    firstTime: true,
  },
  software: {
    type: 'string',
    values: ['vanilla', 'paper', 'purpur'],
    required: true,
    internal: true,
    firstTime: true,
  },
  maxHistory: {
    type: 'number',
    int: true,
    min: 0,
    max: 10000,
  },
  updateAlways: {
    type: 'boolean',
  },
  installed: {
    type: 'boolean',
    internal: true,
  },
  version: {
    type: 'string',
    internal: true,
  },
  build: {
    type: 'number',
    int: true,
    internal: true,
  },
  running: {
    type: 'boolean',
    internal: true,
  },
  history: {
    type: 'string',
    internal: true,
  },

  // Properties
  gamemode: {
    type: 'string',
    values: ['survival', 'creative', 'adventure'],
  },
  difficulty: {
    type: 'string',
    values: ['peaceful', 'easy', 'normal', 'hard'],
  },
  seed: {
    type: 'string',
    min: 0,
    max: 32,
  },
  motd: {
    type: 'string',
    min: 0,
    max: 50,
  },
  levelType: {
    type: 'string',
    values: ['minecraft:normal', 'minecraft:flat', 'minecraft:large_biomes', 'minecraft:amplified'],
  },
  maxPlayers: {
    type: 'number',
    int: true,
    min: 1,
    max: 10000,
  },
  viewDistance: {
    type: 'number',
    int: true,
    min: 3,
    max: 32,
  },
  spawn: {
    type: 'number',
    int: true,
    min: 0,
    max: 32,
  },
  idle: {
    type: 'number',
    int: true,
    min: -1,
    max: 1440,
  },
  commandBlock: {
    type: 'boolean',
  },
  pvp: {
    type: 'boolean',
  },
  licensed: {
    type: 'boolean',
  },
  port: {
    type: 'number',
    internal: true,
  },
  allowlist: {
    type: 'boolean',
  },
  nether: {
    type: 'boolean',
  },
  secureProfile: {
    type: 'boolean',
  },
  forceGamemode: {
    type: 'boolean',
  },
  hardcore: {
    type: 'boolean',
  },
  animals: {
    type: 'boolean',
  },
  monsters: {
    type: 'boolean',
  },
  npcs: {
    type: 'boolean',
  },
  cheats: {
    type: 'boolean',
  },
};

export default Instance;
