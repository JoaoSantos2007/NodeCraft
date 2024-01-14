const Java = {
  'enable-jmx-monitoring': {
    type: 'boolean',
  },
  'rcon.port': {
    type: 'number',
    int: true,
    min: 1,
    max: 65535,
  },
  gamemode: {
    type: 'string',
    values: ['survival', 'creative', 'adventure'],
  },
  'enable-command-block': {
    type: 'boolean',
  },
  'enable-query': {
    type: 'boolean',
  },
  'generator-settings': {
    type: 'object',
  },
  'enforce-secure-profile': {
    type: 'boolean',
  },
  motd: {
    type: 'string',
    min: 4,
    max: 30,
  },
  'query.port': {
    type: 'number',
    int: true,
    min: 1,
    max: 65535,
  },
  pvp: {
    type: 'boolean',
  },
  'generate-structures': {
    type: 'boolean',
  },
  'max-chained-neighbor-updates': {
    type: 'number',
    int: true,
  },
  difficulty: {
    type: 'string',
    values: ['peaceful', 'easy', 'normal', 'hard'],
  },
  'network-compression-threshold': {
    type: 'number',
    int: true,
  },
  'max-tick-time': {
    type: 'number',
    int: true,
    min: -1,
  },
  'require-resource-pack': {
    type: 'boolean',
  },
  'use-native-transport': {
    type: 'boolean',
  },
  'max-players': {
    type: 'number',
    int: true,
    min: 0,
  },
  'online-mode': {
    type: 'boolean',
  },
  'enable-status': {
    type: 'boolean',
  },
  'allow-flight': {
    type: 'boolean',
  },
  'broadcast-rcon-to-ops': {
    type: 'boolean',
  },
  'view-distance': {
    type: 'number',
    int: true,
    min: 3,
    max: 32,
  },
  'allow-nether': {
    type: 'boolean',
  },
  'server-port': {
    type: 'number',
    int: true,
    min: 1,
    max: 65535,
  },
  'enable-rcon': {
    type: 'boolean',
  },
  'sync-chunk-writes': {
    type: 'boolean',
  },
  'op-permission-level': {
    type: 'number',
    int: true,
    min: 0,
    max: 4,
  },
  'prevent-proxy-connections': {
    type: 'boolean',
  },
  'hide-online-players': {
    type: 'boolean',
  },
  'entity-broadcast-range-percentage': {
    type: 'number',
    int: true,
    min: 10,
    max: 10000,
  },
  'simulation-distance': {
    type: 'number',
    int: true,
    min: 3,
    max: 32,
  },
  'player-idle-timeout': {
    type: 'number',
    int: true,
  },
  'force-gamemode': {
    type: 'boolean',
  },
  'rate-limit': {
    type: 'number',
    int: true,
  },
  hardcore: {
    type: 'boolean',
  },
  'white-list': {
    type: 'boolean',
  },
  'broadcast-console-to-ops': {
    type: 'boolean',
  },
  'spawn-npcs': {
    type: 'boolean',
  },
  'spawn-animals': {
    type: 'boolean',
  },
  'log-ips': {
    type: 'boolean',
  },
  'function-permission-level': {
    type: 'number',
    int: true,
    min: 1,
    max: 4,
  },
  'initial-enabled-packs': {
    type: 'string',
  },
  'level-type': {
    type: 'string',
    values: ['minecraft:normal', 'minecraft:flat', 'minecraft:large_biomes', 'minecraft:amplified', 'minecraft:single_biome_surface'],
  },
  'spawn-monsters': {
    type: 'boolean',
  },
  'enforce-whitelist': {
    type: 'boolean',
  },
  'spawn-protection': {
    type: 'number',
    int: true,
  },
  'max-world-size': {
    type: 'number',
    int: true,
    min: 1,
    max: 29999984,
  },
};

export default Java;
