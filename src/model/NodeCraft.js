const NodeCraft = {
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
  },
  software: {
    type: 'string',
    values: ['vanilla', 'paper', 'purpur', 'forge', 'fabric'],
  },
  disableUpdate: {
    type: 'boolean',
  },
  properties: {
    type: 'object',
  },
  friedZone: {
    type: 'object',
  },
};

export default NodeCraft;
