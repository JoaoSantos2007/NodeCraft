import Schema from '../schemas/Minecraft.js';
import validator from './validator.js';

const Minecraft = (data, isUpdate = false, firstTime = false) => {
  validator(data, Schema, isUpdate, firstTime);
};

export default Minecraft;
