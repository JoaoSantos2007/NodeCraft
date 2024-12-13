import User from './User.js';
import Group from './Group.js';
import Role from './Role.js';
import MemberShip from './MemberShip.js';
import db from '../../config/sequelize.js';

Group.hasMany(Role, { as: 'roles' });
Role.belongsTo(Group);

User.belongsToMany(Group, { through: MemberShip, as: 'groups' });
Group.belongsToMany(User, { through: MemberShip, as: 'members' });

MemberShip.belongsTo(User);
MemberShip.belongsTo(Group);
MemberShip.belongsTo(Role);
User.hasMany(MemberShip);
Group.hasMany(MemberShip);

await db.sync({ alter: true });

export {
  User,
  Group,
  Role,
  MemberShip,
};
