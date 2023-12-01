import InvalidRequest from '../errors/InvalidRequest.js';

const nodecraftModel = {
  name: {
    type: 'string',
    min: 4,
    max: 30,
  },
  properties: {
    type: 'object',
  },
};

const propertiesModel = {
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

const analize = (analizedAttribute, field, value) => {
  if (!analizedAttribute) throw new InvalidRequest(`${field} field is not valid`);

  const desiredType = String(analizedAttribute.type);
  if (String(typeof value) !== desiredType) throw new InvalidRequest(`${field} field must be a ${desiredType} value`);

  // For numbers
  if (desiredType === 'number') {
    if (analizedAttribute.int && !Number.isInteger(value)) throw new InvalidRequest(`${field} field must be a integer value`);

    // eslint-disable-next-line prefer-destructuring
    const min = analizedAttribute.min;
    if (min) {
      if (value < min) throw new InvalidRequest(`${field} field must be greater or equal to ${min}`);
    }

    // eslint-disable-next-line prefer-destructuring
    const max = analizedAttribute.max;
    if (max) {
      if (value > max) throw new InvalidRequest(`${field} field must be less or equal to ${max}`);
    }
  }

  // For strings
  if (desiredType === 'string') {
    // eslint-disable-next-line prefer-destructuring
    const min = analizedAttribute.min;
    if (min) {
      if (value.length < min) throw new InvalidRequest(`${field} field characters must be greater or equal to ${min}`);
    }

    // eslint-disable-next-line prefer-destructuring
    const max = analizedAttribute.max;
    if (max) {
      if (value.length > max) throw new InvalidRequest(`${field} field characters must be less or equal to ${max}`);
    }

    const possibleValues = analizedAttribute.values;
    if (possibleValues) {
      if (!possibleValues.includes(value)) throw new InvalidRequest(`${field} field value must be ${possibleValues}`);
    }
  }
};

const validate = (data) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(data)) {
    const analizedAttribute = nodecraftModel[key];
    analize(analizedAttribute, key, value);

    // Analize Properties Object
    if (key === 'properties') {
      const { properties } = data;
      // eslint-disable-next-line no-restricted-syntax
      for (const [propertieKey, propertieValue] of Object.entries(properties)) {
        const analizedPropertie = propertiesModel[propertieKey];
        analize(analizedPropertie, `${key}.${propertieKey}`, propertieValue);
      }
    }
  }
};

export default validate;
