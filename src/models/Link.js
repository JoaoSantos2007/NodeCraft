import { Sequelize, DataTypes, Model } from 'sequelize';
import db from '../../config/sequelize.js';

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
  },
  bedrockGamertag: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  permissions: {
    type: DataTypes.STRING,
    defaultValue: '[]',
  },
  privileges: {
    type: DataTypes.STRING,
    defaultValue: '[]',
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
