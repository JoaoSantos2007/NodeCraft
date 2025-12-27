import { Sequelize, DataTypes, Model } from 'sequelize';
import db from '../../config/sequelize.js';

class Player extends Model { }

Player.init({
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
  gamertag: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bedrockGamertag: {
    type: DataTypes.STRING,
    allowNull: false,
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
    allowNull: false,
  },

}, {
  tableName: 'Player',
  sequelize: db,
  timestamps: false,
});

export default Player;
