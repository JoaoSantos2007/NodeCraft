import Model from '../models/User.js';
import hashPassword from '../utils/hashPassword.js';
import { Duplicate, BadRequest } from '../errors/index.js';
import Instance from './Instance.js';

class User {
  static async create(data) {
    let user = await Model.findOne({
      where: {
        email: data.email,
      },
    });

    // email already registered
    if (user) {
      throw new Duplicate('Email already registered!');
    }

    user = await Model.create({
      name: data.name,
      email: data.email,
      password: hashPassword(data.password),
      gamertag: data.gamertag,
      role: 'member',
    });

    return user;
  }

  static async readAll() {
    const user = await Model.findAll();

    return user;
  }

  static async readOne(id) {
    const user = await Model.findOne({
      where: {
        id,
      },
    });

    if (!user) throw new BadRequest('User not found!');

    return user;
  }

  static async update(id, data) {
    const user = await User.readOne(id);
    await user.update(data);

    return user;
  }

  static async delete(id) {
    const user = await User.readOne(id);
    await user.destroy();

    return user;
  }

  static async getRemainingQuota(id) {
    const user = await User.readOne(id);
    const instances = Instance.readAllByOwner(id);
    const instancesNumber = instances.length;

    const remainingQuota = user.quota - instancesNumber;

    return remainingQuota;
  }
}

export default User;
