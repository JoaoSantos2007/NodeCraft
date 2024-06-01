const Instance = {
  name: {
    type: 'string',
    required: true,
    min: 4,
    max: 30,
  },
  type: {
    type: 'string',
    required: true,
    values: ['bedrock', 'java'],
    internal: true,
  },
  software: {
    type: 'string',
    values: ['vanilla', 'paper', 'purpur', 'forge', 'fabric'],
    internal: true,
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
  maxHistoryLines: {
    type: 'number',
    int: true,
    min: 10,
    max: 10000,
  },
  disableUpdate: {
    type: 'boolean',
  },
  properties: {
    type: 'object',
    internal: true,
  },
  players: {
    type: 'object',
    internal: true,
  },
  history: {
    type: 'array',
    internal: true,
  },
};

export default Instance;
