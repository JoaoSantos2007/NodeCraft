import { Sequelize, DataTypes, Model } from 'sequelize';
import db from '../../config/sequelize.js';

class Role extends Model { }

Role.init({
  id: {
    type: Sequelize.UUIDV4,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  groupId: {

  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  permissons: {
    type: DataTypes.ARRAY,
    allowNull: false,
  },
}, {
  tableName: 'Role',
  sequelize: db,
  timestamps: false,
});

await Role.sync({ alter: true });

export default Role;
