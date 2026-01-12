import { User as Model, Link as LinkModel } from '../models/index.js';
import hash from '../utils/hash.js';
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
      password: hash(data.password),
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

  static async readWithPassword(email) {
    const user = await Model.findOne({
      attributes: ['id', 'email', 'password'],
      where: {
        email,
      },
    });

    return user;
  }

  static async readWithTokens(id) {
    const user = await Model.findByPk(id, {
      attributes: ['id', 'passwordToken', 'emailToken'],
    });

    return user;
  }

  static async saveToken(id, token, type = 'email') {
    const hashToken = hash(token);
    if (type === 'email') await User.update(id, { emailToken: hashToken });
    else if (type === 'password') await User.update(id, { passwordToken: hashToken });
  }

  static async wipeToken(id, type = 'email') {
    if (type === 'email') await User.update(id, { emailToken: null });
    else if (type === 'password') await User.update(id, { passwordToken: null });
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
