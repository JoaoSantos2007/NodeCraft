import { Sequelize, DataTypes, Model } from 'sequelize';
import db from '../../config/sequelize.js';

class Player extends Model { }

Player.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  gamertag: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  operator: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  access: {
    type: DataTypes.STRING,
    values: ['always', 'monitored', 'never'],
    defaultValue: 'monitored',
  },
}, {
  tableName: 'Player',
  sequelize: db,
  timestamps: false,
});

export default Player;
