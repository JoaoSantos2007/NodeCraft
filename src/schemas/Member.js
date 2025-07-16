const Member = {
  id: {
    type: 'string',
    internal: true,
  },
  admin: {
    type: 'boolean',
  },
  permissions: {
    type: 'object',
  },
  userId: {
    type: 'string',
    internal: true,
    firstTime: true,
  },
  roleId: {
    type: 'string',
    internal: true,
    firstTime: true,
  },
  UserId: {
    type: 'string',
    internal: true,
  },
  RoleId: {
    type: 'string',
    internal: true,
  },
  GroupId: {
    type: 'string',
    internal: true,
  },
};

export default Member;
