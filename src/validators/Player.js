import Schema from '../schemas/Player.js';
import validator from './validator.js';

const Player = (data, player = null) => {
  validator(data, Schema, player);
};

export default Player;
