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
  version: {
    type: 'string',
    internal: true,
  },
  build: {
    type: 'number',
    int: true,
    internal: true,
  },
  disableUpdate: {
    type: 'boolean',
  },
  properties: {
    type: 'object',
  },
};

export default Instance;
