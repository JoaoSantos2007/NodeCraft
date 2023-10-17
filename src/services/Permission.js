import PermissionModel from '../model/Permission.js';
import BadRequestError from '../errors/BadRequest.js';

class Permission {
  static async getAll() {
    const permissions = await PermissionModel.findAll();

    return permissions;
  }

  static async getById(id) {
    const permission = await PermissionModel.findOne({
      where: {
        id,
      },
    });

    if (!permission) throw new BadRequestError('Permission not found!');

    return permission;
  }

  static async create({ name, description }) {
    const permission = await PermissionModel.create({ name, description });

    return permission;
  }

  static async update(id, { name, description }) {
    const permission = await Permission.getById(id);
    await permission.update({ name, description });

    return permission;
  }

  static async delete(id) {
    const permission = await Permission.getById(id);
    await permission.destroy();

    return permission;
  }
}

export default Permission;
