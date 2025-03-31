const Player = {
  gamertag: {
    type: 'string',
    required: true,
    max: 50,
  },
  operator: {
    type: 'boolean',
    required: true,
  },
  access: {
    type: 'string',
    required: true,
    values: ['always', 'monitored', 'never'],
  },
};

export default Player;
