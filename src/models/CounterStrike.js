import { DataTypes, Model } from 'sequelize';
import db from '../../config/sequelize.js';

class CounterStrike extends Model { }

CounterStrike.init({
  map: {

  },
  maxPlayer: {

  },
  tickrate: {

  },
  gslt_token: {

  },
  gameMode: {

  },
  mapGroup: {

  },
  startMoney: {

  },
  roundTime: {

  },
  freezeTime: {

  },
  roundsHalftime: {

  },
  maxRounds: {

  },
  friendlyFire: {

  },
  autoTeamBalance: {

  },
  limitTeams: {

  },
  teamCollision: {

  },
  allowSpectators: {

  },
  voiceEnable: {

  },
  alltalk: {

  },
  svDeadtalk: {

  },
  voiceScale: {

  },
}, {
  tableName: 'counterstrike',
  sequelize: db,
  timestamps: false,
});

export default CounterStrike;
