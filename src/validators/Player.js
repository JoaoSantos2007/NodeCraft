import Schema from '../schemas/Player.js';
import validator from './validator.js';

const Player = (data, isUpdate = false) => {
  validator(data, Schema, isUpdate);
};

export default Player;
