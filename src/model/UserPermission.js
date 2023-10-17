import { Sequelize } from 'sequelize';
import db from '../config/sequelize.js';

const UserPermission = db.define('User_Permission', {
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
  permissionId: {
    type: Sequelize.UUIDV4,
    references: {
      model: 'Permission',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
}, {
  timestamps: false,
});

UserPermission.sync({ alter: true });

export default UserPermission;
