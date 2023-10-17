import { Sequelize, DataTypes } from 'sequelize';
import db from '../config/sequelize.js';

const Role = db.define('Role', {
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

Role.sync({ force: true });

export default Role;
