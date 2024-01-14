const Player = {
  accountId: {
    type: 'string',
  },
  gamertag: {
    type: 'string',
    required: true,
    max: 50,
  },
  operator: {
    type: 'boolean',
  },
  admin: {
    type: 'boolean',
  },
  access: {
    type: 'string',
    values: ['always', 'monitored', 'never'],
  },
};

export default Player;
