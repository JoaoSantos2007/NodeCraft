import { Member as Model } from '../models/index.js';
import { BadRequest } from '../errors/index.js';
import User from './User.js';
import Role from './Role.js';

class Member {
  static async readAll(group) {
    const members = await Model.findAll({ where: { GroupId: group.id } });
    return members;
  }

  static async readOne(group, memberId) {
    const member = await Model.findOne({
      where: { GroupId: group.id, id: memberId },
    });

    if (!member) throw new BadRequest('Member not found!');

    return member;
  }

  static async readOneByUser(group, userId) {
    const member = await Model.findOne({
      where: { GroupId: group.id, UserId: userId },
      include: ['Role'],
    });

    if (!member) throw new BadRequest('Member not found!');

    return member;
  }

  static async readAllGroupsByUser(userId) {
    const groups = [];

    const members = await Model.findAll({
      where: { UserId: userId },
    });

    members.forEach((member) => {
      groups.push(member.GroupId);
    });

    return groups;
  }

  static async create(group, data) {
    const user = await User.readOne(data.userId);
    const role = await Role.readOne(group, data.roleId);

    const member = await Model.create({
      GroupId: group.id,
      RoleId: role.id,
      UserId: user.id,
      admin: data.admin,
      permissions: data.permissions,
    });

    return member;
  }

  static async update(group, data) {
    const member = await Member.readOne(group, data.id);

    member.update({
      RoleId: data.roleId,
      permissions: data.permissions,
    });

    await member.save();

    return member;
  }

  static async delete(group, memberId) {
    const member = await Member.readOne(group, memberId);
    await member.destroy();

    return member;
  }
}

export default Member;
