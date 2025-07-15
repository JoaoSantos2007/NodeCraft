const Player = {
  id: {
    type: 'string',
    internal: true,
  },
  instanceId: {
    type: 'string',
    internal: true,
    max: 50,
  },
  gamertag: {
    type: 'string',
    required: false,
    max: 50,
  },
  operator: {
    type: 'boolean',
    required: false,
  },
  access: {
    type: 'string',
    required: true,
    values: ['always', 'monitored', 'never'],
  },
};

export default Player;
