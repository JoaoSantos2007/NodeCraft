import User from './User.js';
import Group from './Group.js';
import Role from './Role.js';
import Member from './Member.js';
import Instance from './Instance.js';
import Player from './Player.js';
import db from '../../config/sequelize.js';

Group.hasMany(Role, { as: 'roles', foreignKey: 'GroupId' });
Role.belongsTo(Group, { foreignKey: 'GroupId' });

User.belongsToMany(Group, { through: Member, as: 'groups', foreignKey: 'UserId' });
Group.belongsToMany(User, { through: Member, as: 'members', foreignKey: 'GroupId' });

Member.belongsTo(User, { foreignKey: 'UserId' });
Member.belongsTo(Group, { foreignKey: 'GroupId' });
Member.belongsTo(Role, { foreignKey: 'RoleId' });
User.hasMany(Member, { foreignKey: 'UserId' });
Group.hasMany(Member, { foreignKey: 'GroupId' });

await db.sync({ force: true });
await db.query('PRAGMA foreign_keys = ON');

export {
  User,
  Group,
  Role,
  Member,
  Instance,
};
