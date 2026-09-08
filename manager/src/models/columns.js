import { DataTypes } from 'sequelize';

const instanceIdColumn = () => ({
  type: DataTypes.UUID,
  primaryKey: true,
  references: {
    model: 'instance',
    key: 'id',
  },
});

export default instanceIdColumn;
