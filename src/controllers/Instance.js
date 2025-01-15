import Service from '../services/Instance.js';
import UserService from '../services/User.js';
import GroupService from '../services/Group.js';
import MemberService from '../services/Member.js';
import AuthService from '../services/Auth.js';
import Bedrock from '../services/Bedrock.js';
import Java from '../services/Java.js';
import { BadRequest, Unathorized } from '../errors/index.js';

class Instance {
  static async create(req, res, next) {
    try {
      const { body, user } = req;
      let owner;

      if (body.group) {
        const group = await GroupService.readOne(body.group);

        // Verify if user has permission to create instance insade group
        const userHasPermission = await AuthService.verifyUserHasPermissionInsideGroup(group, user, 'instance:create');
        if (!userHasPermission) throw new Unathorized("User doesn't have this permission inside group!");

        // Verify Group max quota
        const remainingQuota = await GroupService.getRemainingQuota(group.id);
        if (remainingQuota <= 0) throw new BadRequest('Group has reached the maximum quota!');

        delete body.group;
        owner = group.id;
      } else {
        // Verify User max quota
        const remainingQuota = await UserService.getRemainingQuota(user.id);
        if (remainingQuota <= 0 && user.admin !== true) throw new BadRequest('User has reached the maximum quota!');

        owner = user.id;
      }

      const instance = Service.create(body, owner);
      if (body.type === 'bedrock') Bedrock.install(instance, true);
      else Java.install(instance, true);

      return res.status(201).json({
        success: true, id: instance.id, building: true, instance,
      });
    } catch (err) {
      return next(err);
    }
  }

  static async readAll(req, res, next) {
    try {
      const { user } = req;
      let instances = [];
      let allOwners = [user.id];

      if (user.admin === true) instances = Service.readAll();
      else {
        const groupsId = await MemberService.readAllGroupsByUser(user.id);
        allOwners = allOwners.concat(groupsId);

        instances = Service.readAllByOwners(allOwners);
      }

      return res.status(200).json({ success: true, instances });
    } catch (err) {
      return next(err);
    }
  }

  static readOne(req, res, next) {
    try {
      const { id } = req.params;
      const instance = Service.readOne(id);

      return res.status(200).json({ success: true, instance });
    } catch (err) {
      return next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { body } = req;
      const instance = Service.update(id, body);

      return res.status(200).json({ success: true, updated: true, instance });
    } catch (err) {
      return next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const instance = Service.delete(id);

      return res.status(200).json({ success: true, deleted: true, instance });
    } catch (err) {
      return next(err);
    }
  }
}

export default Instance;
