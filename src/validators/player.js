import Player from '../model/Player.js';
import validator from './validator.js';

const playerValidator = (data, player = null) => {
  validator(data, Player, player);
};

export default playerValidator;
