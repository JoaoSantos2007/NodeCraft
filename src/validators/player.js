import Player from '../models/Player.js';
import validator from './validator.js';

const playerValidator = (data, player = null) => {
  validator(data, Player, player);
};

export default playerValidator;
