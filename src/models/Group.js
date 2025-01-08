import { Sequelize, DataTypes, Model } from 'sequelize';
import db from '../../config/sequelize.js';

class Group extends Model { }

Group.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isAlphanumeric: {
        msg: 'name must be alphanumeric!',
      },
      len: {
        args: [4, 32],
        msg: 'name must have a length between 4 and 32!',
      },
    },
  },
  quota: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isInt: {
        msg: 'quota must be a integer number!',
      },
    },
  },
}, {
  tableName: 'Group',
  sequelize: db,
  timestamps: false,
});

export default Group;
