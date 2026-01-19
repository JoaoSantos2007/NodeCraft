const Link = {
  id: {
    type: 'string',
    internal: true,
  },
  instanceId: {
    type: 'string',
    isUUID: true,
    internal: true,
  },
  userId: {
    type: 'string',
    isUUID: true,
  },
  javaGamertag: {
    type: 'string',
    min: 3,
    max: 50,
  },
  bedrockGamertag: {
    type: 'string',
    min: 3,
    max: 50,
  },
  permissions: {
    type: 'object',
  },
  privileges: {
    type: 'boolean',
  },
  access: {
    type: 'string',
    values: ['super', 'always', 'monitored'],
  },
};

export default Link;
