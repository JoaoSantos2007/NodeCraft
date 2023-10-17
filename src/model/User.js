import { Sequelize, DataTypes } from 'sequelize';
import db from '../config/sequelize.js';
import Role from './Role.js';
import UserRole from './UserRole.js';

const User = db.define('User', {
  id: {
    type: Sequelize.UUIDV4,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gamertag: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: false,
  defaultScope: {
    attributes: {
      exclude: ['password'],
    },
  },
});

User.belongsToMany(Role, {
  through: UserRole,
  as: 'User_Roles',
  foreignKey: 'UserId',
});
User.sync({ force: true });

export default User;
