import { Sequelize, DataTypes } from 'sequelize';
import db from '../config/sequelize.js';

const Permission = db.define('Permission', {
  id: {
    type: Sequelize.UUIDV4,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: false,
});

Permission.sync({ alter: true });

export default Permission;
