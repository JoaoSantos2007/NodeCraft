const PlayerZone = {
  accountId: {
    type: 'string',
  },
  gamertag: {
    type: 'string',
    max: 50,
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

export default PlayerZone;
