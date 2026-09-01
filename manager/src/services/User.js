import { hashSync } from 'bcrypt';
import { User as Model, Link as LinkModel } from '../models/index.js';
import { NotFound, Internal } from '../errors/index.js';

class User {
  static async create(data) {
    const hashedPassword = hashSync(data.password, 12);

    const user = await Model.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    return user.id;
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

    if (!user) throw new NotFound('User not found!');

    return user;
  }

  static async readProfile(id) {
    const user = await Model.findOne({
      where: { id },
      attributes: ['id', 'name'],
    });

    if (!user) throw new NotFound('User not found!');

    return user;
  }

  static async readAllAttributes(id = null, email = null, token = null, tokenType = 'email') {
    const tokenColumns = {
      email: 'emailTokenHash',
      password: 'resetPasswordTokenHash',
      refresh: 'refreshTokenHash',
    };

    const where = {};
    if (id) {
      where.id = id;
    } else if (email) {
      where.email = email;
    } else if (token && tokenColumns[tokenType]) {
      where[tokenColumns[tokenType]] = token;
    }

    if (Object.keys(where).length === 0) throw new Internal('A search criteria is required!');

    const user = await Model.scope(null).findOne({ where });

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
