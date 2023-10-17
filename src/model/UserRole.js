import { Sequelize } from 'sequelize';
import db from '../config/sequelize.js';

const UserRole = db.define('User_Role', {
  id: {
    type: Sequelize.UUIDV4,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: Sequelize.UUIDV4,
    references: {
      model: 'User',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  roleId: {
    type: Sequelize.UUIDV4,
    references: {
      model: 'Role',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
}, {
  timestamps: false,
});

UserRole.sync({ force: true });

export default UserRole;
