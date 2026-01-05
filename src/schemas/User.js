const User = {
  id: {
    type: 'string',
    internal: true,
    isUUID: true,
  },
  name: {
    type: 'string',
    min: 2,
    max: 32,
  },
  email: {
    type: 'string',
    min: 5,
    max: 257,
    required: true,
    internal: true,
    firstTime: true,
  },
  password: {
    type: 'string',
    required: true,
    internal: true,
    firstTime: true,
  },
  gamertag: {
    type: 'string',
    min: 0,
    max: 80,
  },
  admin: {
    type: 'boolean',
    internal: true,
  },
};

export default User;
