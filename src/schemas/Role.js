const Role = {
  id: {
    type: 'string',
    internal: true,
  },
  name: {
    type: 'string',
    required: true,
    min: 2,
    max: 32,
  },
  permissions: {
    type: 'object',
  },
  GroupId: {
    type: 'string',
    internal: true,
  },
};

export default Role;
