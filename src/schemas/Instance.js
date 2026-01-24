const Instance = {
  id: {
    type: 'string',
    internal: true,
    isUUID: true,
  },
  owner: {
    type: 'string',
    internal: true,
    isUUID: true,
  },
  name: {
    type: 'string',
    required: true,
    min: 3,
    max: 32,
  },
  type: {
    type: 'string',
    values: ['minecraft', 'hytale', 'cs2', 'terraria', 'ark', 'ksp'],
  },
  port: {
    type: 'number',
    internal: true,
  },
  installed: {
    type: 'boolean',
    internal: true,
  },
  updateAlways: {
    type: 'boolean',
  },
  running: {
    type: 'boolean',
    internal: true,
  },
  history: {
    type: 'string',
    internal: true,
  },
  config: {
    type: 'object',
  },
};

export default Instance;
