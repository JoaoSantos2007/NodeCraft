import { Sequelize, DataTypes, Model } from 'sequelize';
import db from '../../config/sequelize.js';

class WorkerHeartbeat extends Model { }

WorkerHeartbeat.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  workerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'worker',
      key: 'id',
    },
  },
  cpuUsage: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  memoryTotal: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  memoryUsed: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  diskAvailable: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'worker_heartbeat',
  sequelize: db,
  timestamps: false,
  indexes: [
    { fields: ['workerId', 'createdAt'] },
    { name: 'worker_heartbeat_created_at', fields: ['createdAt'] },
  ],
});

export default WorkerHeartbeat;
