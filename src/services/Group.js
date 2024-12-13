import { Group as Model } from '../model/index.js';
import { BadRequest, InvalidRequest } from '../errors/index.js';

class Group {
  static async readAll() {
    const groups = await Model.findAll({ include: ['roles', 'members'] });
    return groups;
  }

  static async readOne(id) {
    const group = await Model.findByPk(id);
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
