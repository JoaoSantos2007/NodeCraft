const Properties = {
  'server-name': {
    type: 'string',
  },
  gamemode: {
    type: 'string',
    values: ['survival', 'creative', 'adventure'],
  },
  'force-gamemode': {
    type: 'boolean',
  },
  difficulty: {
    type: 'string',
    values: ['peaceful', 'easy', 'normal', 'hard'],
  },
  'allow-cheats': {
    type: 'boolean',
    onlyBedrock: true,
  },
  'max-players': {
    type: 'number',
    int: true,
    min: 1,
  },
  'online-mode': {
    type: 'boolean',
  },
  'allow-list': {
    type: 'boolean',
    onlyBedrock: true,
  },
  'server-port': {
    type: 'number',
    int: true,
    min: 1,
    max: 65535,
  },
  'server-portv6': {
    type: 'number',
    int: true,
    min: 1,
    max: 65535,
    onlyBedrock: true,
  },
  'enable-lan-visibility': {
    type: 'boolean',
    onlyBedrock: true,
  },
  'view-distance': {
    type: 'number',
    int: true,
    min: 5,
  },
  'tick-distance': {
    type: 'number',
    int: true,
    min: 4,
    max: 12,
    onlyBedrock: true,
  },
  'player-idle-timeout': {
    type: 'number',
    int: true,
  },
  'max-threads': {
    type: 'number',
    int: true,
    onlyBedrock: true,
  },
  'default-player-permission-level': {
    type: 'string',
    values: ['visitor', 'member', 'operator'],
    onlyBedrock: true,
  },
  'texturepack-required': {
    type: 'boolean',
    onlyBedrock: true,
  },
  'content-log-file-enabled': {
    type: 'boolean',
    onlyBedrock: true,
  },
  'compression-threshold': {
    type: 'number',
    int: true,
    min: 1,
    max: 65535,
    onlyBedrock: true,
  },
  'compression-algorithm': {
    type: 'string',
    values: ['zlib', 'snappy'],
    onlyBedrock: true,
  },
  'server-authoritative-movement': {
    type: 'string',
    values: ['client-auth', 'server-auth', 'server-auth-with-rewind'],
    onlyBedrock: true,
  },
  'player-movement-score-threshold': {
    type: 'number',
    int: true,
    min: 1,
    onlyBedrock: true,
  },
  'player-movement-action-direction-threshold': {
    type: 'number',
    min: 0,
    max: 1,
    onlyBedrock: true,
  },
  'player-movement-distance-threshold': {
    type: 'number',
    min: 0,
    onlyBedrock: true,
  },
  'player-movement-duration-threshold-in-ms': {
    type: 'number',
    int: true,
    min: 1,
    onlyBedrock: true,
  },
  'correct-player-movement': {
    type: 'boolean',
    onlyBedrock: true,
  },
  'server-authoritative-block-breaking': {
    type: 'boolean',
    onlyBedrock: true,
  },
  'chat-restriction': {
    type: 'string',
    values: ['None', 'Dropped', 'Disabled'],
    onlyBedrock: true,
  },
  'disable-player-interaction': {
    type: 'boolean',
    onlyBedrock: true,
  },
  'client-side-chunk-generation-enabled': {
    type: 'boolean',
    onlyBedrock: true,
  },
  'block-network-ids-are-hashes': {
    type: 'boolean',
    onlyBedrock: true,
  },
  'disable-persona': {
    type: 'boolean',
    onlyBedrock: true,
  },
  'disable-custom-skins': {
    type: 'boolean',
    onlyBedrock: true,
  },
  'admin-slot': {
    type: 'boolean',
  },
  'grow-trees': {
    type: 'boolean',
  },
  motd: {
    type: 'string',
    min: 4,
    max: 30,
  },
  'enable-jmx-monitoring': {
    type: 'boolean',
    onlyJava: true,
  },
  'rcon.port': {
    type: 'number',
    int: true,
    min: 1,
    max: 65535,
    onlyJava: true,
  },
  'enable-command-block': {
    type: 'boolean',
    onlyJava: true,
  },
  'enable-query': {
    type: 'boolean',
    onlyJava: true,
  },
  'generator-settings': {
    type: 'object',
    onlyJava: true,
  },
  'enforce-secure-profile': {
    type: 'boolean',
    onlyJava: true,
  },
  'query.port': {
    type: 'number',
    int: true,
    min: 1,
    max: 65535,
    onlyJava: true,
  },
  pvp: {
    type: 'boolean',
    onlyJava: true,
  },
  'generate-structures': {
    type: 'boolean',
    onlyJava: true,
  },
  'max-chained-neighbor-updates': {
    type: 'number',
    int: true,
    onlyJava: true,
  },
  'network-compression-threshold': {
    type: 'number',
    int: true,
    onlyJava: true,
  },
  'max-tick-time': {
    type: 'number',
    int: true,
    min: -1,
    onlyJava: true,
  },
  'require-resource-pack': {
    type: 'boolean',
    onlyJava: true,
  },
  'use-native-transport': {
    type: 'boolean',
    onlyJava: true,
  },
  'enable-status': {
    type: 'boolean',
    onlyJava: true,
  },
  'allow-flight': {
    type: 'boolean',
    onlyJava: true,
  },
  'broadcast-rcon-to-ops': {
    type: 'boolean',
    onlyJava: true,
  },
  'allow-nether': {
    type: 'boolean',
    onlyJava: true,
  },
  'enable-rcon': {
    type: 'boolean',
    onlyJava: true,
  },
  'sync-chunk-writes': {
    type: 'boolean',
    onlyJava: true,
  },
  'op-permission-level': {
    type: 'number',
    int: true,
    min: 0,
    max: 4,
    onlyJava: true,
  },
  'prevent-proxy-connections': {
    type: 'boolean',
    onlyJava: true,
  },
  'hide-online-players': {
    type: 'boolean',
    onlyJava: true,
  },
  'entity-broadcast-range-percentage': {
    type: 'number',
    int: true,
    min: 10,
    max: 10000,
    onlyJava: true,
  },
  'simulation-distance': {
    type: 'number',
    int: true,
    min: 3,
    max: 32,
    onlyJava: true,
  },
  'rate-limit': {
    type: 'number',
    int: true,
    onlyJava: true,
  },
  hardcore: {
    type: 'boolean',
    onlyJava: true,
  },
  'white-list': {
    type: 'boolean',
    onlyJava: true,
  },
  'broadcast-console-to-ops': {
    type: 'boolean',
    onlyJava: true,
  },
  'spawn-npcs': {
    type: 'boolean',
    onlyJava: true,
  },
  'spawn-animals': {
    type: 'boolean',
    onlyJava: true,
  },
  'log-ips': {
    type: 'boolean',
    onlyJava: true,
  },
  'function-permission-level': {
    type: 'number',
    int: true,
    min: 1,
    max: 4,
    onlyJava: true,
  },
  'initial-enabled-packs': {
    type: 'string',
    onlyJava: true,
  },
  'level-type': {
    type: 'string',
    values: ['minecraft:normal', 'minecraft:flat', 'minecraft:large_biomes', 'minecraft:amplified', 'minecraft:single_biome_surface'],
    onlyJava: true,
  },
  'spawn-monsters': {
    type: 'boolean',
    onlyJava: true,
  },
  'enforce-whitelist': {
    type: 'boolean',
    onlyJava: true,
  },
  'spawn-protection': {
    type: 'number',
    int: true,
    onlyJava: true,
  },
  'max-world-size': {
    type: 'number',
    int: true,
    min: 1,
    max: 29999984,
    onlyJava: true,
  },
  public: {
    type: 'boolean',
  },
  'max-connections': {
    type: 'number',
    int: true,
    min: 1,
    max: 3,
  },
  'verify-names': {
    type: 'boolean',
  },
};

export default Properties;
