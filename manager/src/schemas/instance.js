import Joi from 'joi';
import minecraft from './minecraft.js';
import kerbal from './kerbal.js';
import hytale from './hytale.js';
import terraria from './terraria.js';

const createInstance = Joi.object({
  id: Joi.forbidden(),
  owner: Joi.forbidden(),
  name: Joi.string().trim().min(3).max(32).required(),
  workerId: Joi.string().trim().uuid().required(),
  type: Joi.string().trim().valid('minecraft', 'hytale', 'terraria', 'kerbal').required(),
  port: Joi.forbidden(),
  memory: Joi.number().integer().min(512),
  cpu: Joi.number().integer().min(1),
  maxPlayers: Joi.number().integer().min(1).max(1000),
  status: Joi.forbidden(),
  history: Joi.forbidden(),
  game: Joi.when('type', {
    switch: [
      { is: 'minecraft', then: minecraft },
      { is: 'kerbal', then: kerbal },
      { is: 'hytale', then: hytale },
      { is: 'terraria', then: terraria },
    ],
    otherwise: Joi.forbidden(),
  }).required(),
});

const updateInstance = Joi.object({
  id: Joi.forbidden(),
  owner: Joi.forbidden(),
  name: Joi.string().trim().min(3).max(32),
  workerId: Joi.forbidden(),
  type: Joi.string().trim().strip().valid('minecraft', 'hytale', 'terraria', 'kerbal'),
  port: Joi.forbidden(),
  memory: Joi.number().integer().min(512),
  cpu: Joi.number().integer().min(1),
  maxPlayers: Joi.number().integer().min(1).max(1000),
  status: Joi.forbidden(),
  history: Joi.forbidden(),
  game: Joi.when('type', {
    switch: [
      { is: 'minecraft', then: minecraft },
      { is: 'kerbal', then: kerbal },
      { is: 'hytale', then: hytale },
      { is: 'terraria', then: terraria },
    ],
    otherwise: Joi.forbidden(),
  }).required(),
}).min(1);

const transferOwner = Joi.object({
  owner: Joi.string().trim().uuid().required(),
});

const changeWorker = Joi.object({
  workerId: Joi.string().trim().uuid().allow(null).required(),
});

export {
  createInstance, updateInstance, transferOwner, changeWorker,
};
