const Group = {
  id: {
    type: 'string',
    internal: true,
  },
  name: {
    type: 'string',
    required: true,
    min: 4,
    max: 32,
  },
  quota: {
    type: 'number',
    int: true,
    min: 0,
    max: 150,
  },
};

export default Group;
