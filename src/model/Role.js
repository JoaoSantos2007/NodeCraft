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
  permissons: {
    type: DataTypes.JSON,
    allowNull: false,
  },
}, {
  tableName: 'Role',
  sequelize: db,
  timestamps: false,
});

export default Role;
