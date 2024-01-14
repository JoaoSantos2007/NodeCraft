import { Sequelize, DataTypes, Model } from 'sequelize';
import db from '../config/sequelize.js';

class User extends Model { }

User.init({
  id: {
    type: Sequelize.UUIDV4,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gamertag: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'User',
  sequelize: db,
  timestamps: false,
  defaultScope: {
    attributes: {
      exclude: ['password'],
    },
  },
});

await User.sync({ alter: true });

export default User;
