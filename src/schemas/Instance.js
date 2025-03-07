const Instance = {
  id: {
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
  },
  software: {
    type: 'string',
    values: ['vanilla', 'paper', 'purpur'],
    internal: true,
  },
  maxHistory: {
    type: 'number',
    int: true,
    min: 10,
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
  run: {
    type: 'boolean',
    internal: true,
  },
  history: {
    type: 'string',
    internal: true,
  },
};

export default Instance;
