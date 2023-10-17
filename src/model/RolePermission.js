import { Sequelize } from 'sequelize';
import db from '../config/sequelize.js';

const RolePermission = db.define('Role_Permission', {
  id: {
    type: Sequelize.UUIDV4,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
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

RolePermission.sync({ alter: true });

export default RolePermission;
