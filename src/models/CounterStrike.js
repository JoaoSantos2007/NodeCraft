import { DataTypes, Model } from 'sequelize';
import db from '../../config/sequelize.js';

class CounterStrike extends Model { }

CounterStrike.init({
  steamToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  map: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'counterstrike',
  sequelize: db,
  timestamps: false,
});

export default CounterStrike;
