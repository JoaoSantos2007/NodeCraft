import User from './User.js';
import Group from './Group.js';
import Role from './Role.js';
import Member from './Member.js';
import db from '../../config/sequelize.js';

Group.hasMany(Role, { as: 'roles' });
Role.belongsTo(Group);

User.belongsToMany(Group, { through: Member, as: 'groups' });
Group.belongsToMany(User, { through: Member, as: 'members' });

Member.belongsTo(User);
Member.belongsTo(Group);
Member.belongsTo(Role);
User.hasMany(Member);
Group.hasMany(Member);

await db.sync({ alter: true });

export {
  User,
  Group,
  Role,
  Member,
};
