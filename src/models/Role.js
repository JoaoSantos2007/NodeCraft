import { Sequelize, DataTypes, Model } from 'sequelize';
import db from '../../config/sequelize.js';

class Role extends Model { }

Role.init({
  id: {
    type: Sequelize.UUIDV4,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
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
      },
    },
  },
}, {
  tableName: 'Role',
  sequelize: db,
  timestamps: false,
});

export default Role;
