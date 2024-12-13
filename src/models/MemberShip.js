import { Sequelize, DataTypes, Model } from 'sequelize';
import db from '../../config/sequelize.js';

class MemberShip extends Model { }

MemberShip.init({
  id: {
    type: Sequelize.UUIDV4,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  admin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  permissons: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'MemberShip',
  sequelize: db,
  timestamps: false,
});

export default MemberShip;
