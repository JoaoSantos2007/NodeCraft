import { Sequelize, DataTypes, Model } from 'sequelize';
import db from '../../config/sequelize.js';

class Worker extends Model { }

Worker.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'name field cannot be empty!',
      },
      is: {
        args: /^[a-zA-ZÀ-ÿ0-9\s]+$/i,
        msg: 'name field must be valid!',
      },
      len: {
        args: [3, 32],
        msg: 'name field must have a length between 3 and 32!',
      },
    },
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  apiKey: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  secret: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  healthy: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  lastSeenAt: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  cpuUsage: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  memoryTotal: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'memoryTotal field must be greater than or equal to 0mb!',
      },
    },
  },
  memoryUsed: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'memoryUsed field must be greater than or equal to 0mb!',
      },
    },
  },
  diskAvailable: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'diskAvailable field must be greater than or equal to 0mb!',
      },
    },
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'worker',
  sequelize: db,
  timestamps: true,
  updatedAt: false,
  indexes: [
    { name: 'worker_healthy_last_seen_at', fields: ['healthy', 'lastSeenAt'] },
  ],
  defaultScope: {
    attributes: { exclude: ['apiKey', 'secret'] },
  },
  scopes: {
    withSecret: { attributes: { exclude: ['apiKey'] } },
    withApiKey: {},
  },
});

export default Worker;
