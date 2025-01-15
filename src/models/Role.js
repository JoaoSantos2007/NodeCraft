import { Sequelize, DataTypes, Model } from 'sequelize';
import db from '../../config/sequelize.js';
import { PERMISSIONS } from '../../config/settings.js';

class Role extends Model { }

Role.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isAlphanumeric: {
        msg: 'name must be alphanumeric!',
      },
      len: {
        args: [2, 32],
        msg: 'name must have a length between 2 and 32!',
      },
    },
  },
  permissions: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('permissions');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('permissions', JSON.stringify(value));
    },
    validate: {
      isValidArray(value) {
        const parsed = Array.isArray(value) ? value : JSON.parse(value);
        if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === 'string')) {
          throw new Error('Permissions field must be a type of array!');
        }
        parsed.forEach((item) => {
          if (!PERMISSIONS.includes(item)) throw new Error(`${item} is an invalid permission!`);
        });
      },
    },
  },
  GroupId: {
    type: Sequelize.UUIDV4,
    allowNull: false,
    references: {
      model: 'Group',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    validate: {
      isUUID: {
        args: 4,
        msg: 'GroupId must be a uuid!',
      },
    },
  },
}, {
  tableName: 'Role',
  sequelize: db,
  timestamps: false,
});

export default Role;
