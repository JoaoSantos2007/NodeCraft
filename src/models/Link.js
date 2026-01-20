import { Sequelize, DataTypes, Model } from 'sequelize';
import db from '../../config/sequelize.js';
import config from '../../config/index.js';
import instancesRunning from '../runtime/instancesRunning.js';

class Link extends Model { }

Link.init({
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
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  javaGamertag: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  bedrockGamertag: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: ['instance:read'],
    validate: {
      isValidArray(value) {
        if (!Array.isArray(value)) {
          throw new Error('Permissions field must be an array!');
        }

        if (!value.every((item) => typeof item === 'string')) {
          throw new Error('Permissions must contain only strings!');
        }

        value.forEach((item) => {
          if (!config.instance.permissions.includes(item)) {
            throw new Error(`${item} is an invalid permission!`);
          }
        });
      },
    },
  },
  privileges: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  access: {
    type: DataTypes.STRING,
    values: ['super', 'always', 'monitored'],
    defaultValue: 'always',
    allowNull: false,
  },
}, {
  tableName: 'link',
  sequelize: db,
  timestamps: false,
});

const updateBarrier = async (id) => {
  if (instancesRunning[id]) {
    instancesRunning[id].barrier.needUpdate = true;
    // instancesRunning[id].instance = await Instance.readOne(id);
  }
};

Link.addHook('afterCreate', async (link) => {
  await updateBarrier(link.instanceId);
});

Link.addHook('afterDestroy', async (link) => {
  await updateBarrier(link.instanceId);
});

Link.addHook('afterUpdate', async (link) => {
  await updateBarrier(link.instanceId);
});

export default Link;
