import { Sequelize, DataTypes, Model } from 'sequelize';
import db from '../../config/sequelize.js';

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
  GroupId: { // Campo explícito para a chave estrangeira
    type: Sequelize.UUIDV4,
    allowNull: false, // Ajuste conforme necessário
    references: {
      model: 'Group',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
}, {
  tableName: 'Role',
  sequelize: db,
  timestamps: false,
});

export default Role;
