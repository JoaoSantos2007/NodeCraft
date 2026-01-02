import { Sequelize, DataTypes, Model } from 'sequelize';
import db from '../../config/sequelize.js';
import { PERMISSIONS } from '../../config/settings.js';

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
    onDelete: 'CASCADE',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  javaGamertag: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  bedrockGamertag: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: ['instance:read'],
    validate: {
      isValidArray(value) {
        if (!Array.isArray(value)) {
          throw new Error('Permissions field must be an array!');
        }

        if (!value.every((item) => typeof item === 'string')) {
          throw new Error('Permissions must contain only strings!');
        }

        value.forEach((item) => {
          if (!PERMISSIONS.includes(item)) {
            throw new Error(`${item} is an invalid permission!`);
          }
        });
      },
    },
  },
  privileges: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  access: {
    type: DataTypes.STRING,
    values: ['always', 'monitored'],
    defaultValue: 'always',
    allowNull: false,
  },
}, {
  tableName: 'link',
  sequelize: db,
  timestamps: false,
});

export default Link;
