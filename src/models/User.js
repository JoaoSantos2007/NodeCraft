import { Sequelize, DataTypes, Model } from 'sequelize';
import db from '../../config/sequelize.js';

class User extends Model { }

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  admin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: {
        args: /^[a-zA-ZÀ-ÿ0-9\s]+$/i,
        msg: 'name must be valid!',
      },
      len: {
        args: [2, 32],
        msg: 'name must have a length between 2 and 32!',
      },
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'email must be valid!',
      },
      len: {
        args: [1, 257],
        msg: 'email must have a length between 1 and 257!',
      },
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  javaGamertag: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: {
        args: [0, 80],
        msg: 'java gamertag must have a length under 80!',
      },
    },
  },
  bedrockGamertag: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: {
        args: [0, 80],
        msg: 'bedrock gamertag must have a length under 80!',
      },
    },
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  birthDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  timePlayed: {
    type: DataTypes.NUMBER,
    allowNull: true,
    defaultValue: 0,
  },
  emailToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  passwordToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'user',
  sequelize: db,
  timestamps: false,
  defaultScope: {
    attributes: {
      exclude: ['password', 'emailToken', 'passwordToken'],
    },
  },
});

export default User;
