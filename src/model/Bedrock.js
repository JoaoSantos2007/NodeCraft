const Bedrock = {
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
  },
  'max-players': {
    type: 'number',
    int: true,
    min: 1,
  },
  'online-mode': {
    type: 'string',
  },
  'allow-list': {
    type: 'boolean',
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
  },
  'enable-lan-visibility': {
    type: 'boolean',
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
  },
  'player-idle-timeout': {
    type: 'number',
    int: true,
  },
  'max-threads': {
    type: 'number',
    int: true,
  },
  'default-player-permission-level': {
    type: 'string',
    values: ['visitor', 'member', 'operator'],
  },
  'texturepack-required': {
    type: 'boolean',
  },
  'content-log-file-enabled': {
    type: 'boolean',
  },
  'compression-threshold': {
    type: 'number',
    int: true,
    min: 1,
    max: 65535,
  },
  'compression-algorithm': {
    type: 'string',
    values: ['zlib', 'snappy'],
  },
  'server-authoritative-movement': {
    type: 'string',
    values: ['client-auth', 'server-auth', 'server-auth-with-rewind'],
  },
  'player-movement-score-threshold': {
    type: 'number',
    int: true,
    min: 1,
  },
  'player-movement-action-direction-threshold': {
    type: 'number',
    min: 0,
    max: 1,
  },
  'player-movement-distance-threshold': {
    type: 'number',
    min: 0,
  },
  'player-movement-duration-threshold-in-ms': {
    type: 'number',
    int: true,
    min: 1,
  },
  'correct-player-movement': {
    type: 'boolean',
  },
  'server-authoritative-block-breaking': {
    type: 'boolean',
  },
  'chat-restriction': {
    type: 'string',
    values: ['None', 'Dropped', 'Disabled'],
  },
  'disable-player-interaction': {
    type: 'boolean',
  },
  'client-side-chunk-generation-enabled': {
    type: 'boolean',
  },
  'block-network-ids-are-hashes': {
    type: 'boolean',
  },
  'disable-persona': {
    type: 'boolean',
  },
  'disable-custom-skins': {
    type: 'boolean',
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
  public: {
    type: 'boolean',
  },
  'verify-names': {
    type: 'boolean',
  },
};

export default Bedrock;
