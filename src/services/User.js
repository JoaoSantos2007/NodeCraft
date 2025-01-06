import Model from '../models/User.js';
import hashPassword from '../utils/hashPassword.js';
import { Duplicate, BadRequest } from '../errors/index.js';
import Instance from './Instance.js';

class User {
  // eslint-disable-next-line object-curly-newline
  static async register({ name, email, password, gamertag }) {
    let user = await Model.findOne({
      where: {
        email,
      },
    });

    // email already registered
    if (user) {
      throw new Duplicate('Email already registered!');
    }

    user = await Model.create({
      name,
      email,
      password: hashPassword(password),
      gamertag,
      role: 'member',
    });

    return user;
  }

  static async readUsers() {
    const user = await Model.findAll();

    return user;
  }

  static async readUserById(id) {
    const user = await Model.findOne({
      where: {
        id,
      },
    });

    if (!user) throw new BadRequest('User not found!');

    return user;
  }

  static async updateUser(id, data) {
    const user = await User.readUserById(id);
    await user.update(data);

    return user;
  }

  static async deleteUser(id) {
    const user = await User.readUserById(id);
    await user.destroy();

    return user;
  }

  static async getRemainingQuota(id) {
    const user = await User.readUserById(id);
    const instances = Instance.readAllByOwner(id);
    const instancesNumber = instances.length;

    const remainingQuota = user.quota - instancesNumber;

    return remainingQuota;
  }
}

export default User;
