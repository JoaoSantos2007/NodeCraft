import { Group as Model } from '../models/index.js';
import { BadRequest, InvalidRequest } from '../errors/index.js';

class Group {
  static async readAll() {
    const groups = await Model.findAll({
      include: [
        {
          association: 'roles',
          attributes: ['id', 'name', 'permissions', 'GroupId'], // Inclua apenas os campos relevantes
        },
        {
          association: 'Members', // Use o mesmo alias definido na associação
          attributes: ['id', 'admin', 'permissions', 'UserId', 'GroupId', 'RoleId'], // Campos desejados do Member
        },
      ],
    });

    return groups;
  }

  static async readOne(id) {
    const group = await Model.findByPk(id, {
      include: [
        {
          association: 'roles',
          attributes: ['id', 'name', 'permissions', 'GroupId'], // Inclua apenas os campos relevantes
        },
        {
          association: 'Members', // Use o mesmo alias definido na associação
          attributes: ['id', 'admin', 'permissions', 'UserId', 'GroupId', 'RoleId'], // Campos desejados do Member
        },
      ],
    });

    if (!group) throw new BadRequest('Group not found!');

    return group;
  }

  static async create(data) {
    const name = data?.name;
    if (!name) throw new InvalidRequest('Name field is missing!');

    const group = await Model.create({ name });

    return group;
  }

  static async update(id, data) {
    const name = data?.name;
    if (!name) throw new InvalidRequest('Name field is missing!');

    const group = await Group.readOne(id);
    await group.update({ name });

    return Group.readOne(id);
  }

  static async delete(id) {
    const group = await Group.readOne(id);
    await group.destroy();

    return group;
  }
}

export default Group;
