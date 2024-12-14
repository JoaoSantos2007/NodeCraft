import { Role as Model } from '../models/index.js';
import { BadRequest } from '../errors/index.js';

class Role {
  static async readAll(group) {
    const roles = await Model.findAll({ where: { GroupId: group.id } });

    return roles;
  }

  static async readOne(group, roleId) {
    const role = await Model.findOne({
      where: {
        id: roleId,
        GroupId: group.id,
      },
    });

    if (!role) throw new BadRequest('Role not found!');

    return role;
  }

  static async create(group, data) {
    const role = await Model.create({
      name: data.name,
      permissions: data.permissions,
      GroupId: group.id,
    });

    return role;
  }

  static async update(group, roleId, data) {
    const role = await Role.readOne(group, roleId);

    await role.update({
      name: data.name,
      permissions: data.permissions,
    });

    return role;
  }

  static async delete(group, roleId) {
    const role = await Role.readOne(group, roleId);
    await role.destroy();

    return role;
  }
}

export default Role;
