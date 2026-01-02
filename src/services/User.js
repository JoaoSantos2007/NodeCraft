import { User as Model, Link as LinkModel } from '../models/index.js';
import hashPassword from '../utils/hashPassword.js';
import { Duplicate, BadRequest } from '../errors/index.js';

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
      javaGamertag: data.javaGamertag,
      bedrockGamertag: data.bedrockGamertag,
      gender: data.gender,
      birthDate: data.birthDate,
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
      include: {
        model: LinkModel,
        as: 'instances',
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
}

export default User;
