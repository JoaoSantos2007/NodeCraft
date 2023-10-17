import RoleModel from '../model/Role.js';
import BadRequestError from '../errors/BadRequest.js';

class Role {
  static async getAll() {
    const roles = await RoleModel.findAll();

    return roles;
  }

  static async getById(id) {
    const role = await RoleModel.findOne({
      where: {
        id,
      },
    });

    if (!role) throw new BadRequestError('Role not found!');

    return role;
  }

  static async create({ name, description }) {
    const role = await RoleModel.create({ name, description });

    return role;
  }

  static async update(id, { name, description }) {
    const role = await Role.getById(id);
    await role.update({ name, description });

    return role;
  }

  static async delete(id) {
    const role = await Role.getById(id);
    await role.destroy();

    return role;
  }
}

export default Role;
