import { Sequelize, DataTypes, Model } from 'sequelize';
import db from '../../config/sequelize.js';

class MemberShip extends Model { }

MemberShip.init({
  id: {
    type: Sequelize.UUIDV4,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  groupId: {
    type: DataTypes.UUIDV4,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUIDV4,
    allowNull: false,
  },
  admin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  roleId: {
    type: DataTypes.UUIDV4,
    allowNull: true,
  },
  permissons: {
    type: DataTypes.ARRAY,
    allowNull: true,
  },
}, {
  tableName: 'MemberShip',
  sequelize: db,
  timestamps: false,
});

await MemberShip.sync({ alter: true });

export default MemberShip;
