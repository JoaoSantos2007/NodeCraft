import { Sequelize, DataTypes, Model } from 'sequelize';
import db from '../../config/sequelize.js';
import { permissions } from '../../config/settings.js';

class Member extends Model {}

Member.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  admin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
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
          if (!permissions.includes(item)) throw new Error(`${item} is an invalid permission!`);
        });
      },
    },
  },
  UserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    validate: {
      isUUID: {
        args: 4,
        msg: 'UserId must be a uuid!',
      },
    },
  },
  GroupId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Group',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    validate: {
      isUUID: {
        args: 4,
        msg: 'GroupId must be a uuid!',
      },
    },
  },
  RoleId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Role',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    validate: {
      isUUID: {
        args: 4,
        msg: 'RoleId must be a uuid!',
      },
    },
  },
}, {
  sequelize: db,
  tableName: 'Member',
  timestamps: false,
});

export default Member;
