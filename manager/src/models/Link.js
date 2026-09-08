import { Sequelize, DataTypes, Model } from 'sequelize';
import db from '../../config/sequelize.js';
import { isPermissionArray } from './validators.js';

class Link extends Model { }

Link.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  instanceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'instance',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'user',
      key: 'id',
    },
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    validate: {
      isValidArray: isPermissionArray('Permissions'),
    },
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'link',
  sequelize: db,
  timestamps: true,
  updatedAt: false,
  indexes: [
    { unique: true, fields: ['instanceId', 'userId'], name: 'link_instance_id_user_id_unique' },
  ],
});

export default Link;
