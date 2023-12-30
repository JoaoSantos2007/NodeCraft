const Player = {
  gamertag: {
    type: 'string',
    required: true,
    max: 50,
  },
  accountId: {
    type: 'string',
  },
  ip: {
    type: 'string',
    max: 50,
  },
  role: {
    type: 'string',
    values: ['visitor', 'member', 'operator'],
  },
  banned: {
    type: 'boolean',
  },
  admin: {
    type: 'boolean',
  },
  authorization: {
    type: 'string',
    values: ['always', 'monitored', 'never'],
  },
};

export default Player;
