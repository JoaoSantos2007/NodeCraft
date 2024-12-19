import { Member as Model } from '../models/index.js';

class Member {
  static async readAll(group) {
    const members = await Model.findAll({ where: { GroupId: group.id } });
    return members;
  }

  static async readOne(group, ) {

  }

  static async create(group, data) {
    const member = await Model.create({
      GroupId: group.id,
      RoleId: data.roleId,
      UserId: data.userId,
      admin: data.admin,
      permissions: data.permissions,
    });

    return member;
  }
}

export default Member;
