import { Sequelize } from 'sequelize';
import { Group as Model } from '../models/index.js';
import { BadRequest, InvalidRequest } from '../errors/index.js';
import Instance from './Instance.js';

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

  static async readAllGroupsByIds(groupsId) {
    const groups = await Model.findAll({
      where: {
        id: {
          [Sequelize.Op.in]: groupsId,
        },
      },
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
    const group = await Group.readOne(id);
    await group.update({ name: data.name, quota: data.quota });

    return Group.readOne(id);
  }

  static async delete(id) {
    const group = await Group.readOne(id);
    await group.destroy();

    return group;
  }

  static async getRemainingQuota(id) {
    const group = await Group.readOne(id);
    const instances = Instance.readAllByOwner(id);
    const instancesNumber = instances.length;

    const remainingQuota = group.quota - instancesNumber;

    return remainingQuota;
  }
}

export default Group;
