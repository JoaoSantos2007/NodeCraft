import Service from '../services/Instance.js';
import UserService from '../services/User.js';
import GroupService from '../services/Group.js';
import Bedrock from '../services/Bedrock.js';
import Java from '../services/Java.js';
import { BadRequest } from '../errors/index.js';

class Instance {
  static async create(req, res, next) {
    try {
      const { body, user } = req;
      let owner;

      if (body.group) {
        // Verify Group max quota
        const group = await GroupService.readOne(body.group);
        const remainingQuota = await GroupService.getRemainingQuota(group.id);
        if (remainingQuota <= 0) throw new BadRequest('Group has reached the maximum quota!');

        owner = group.id;
      } else {
        // Verify User max quota
        const remainingQuota = await UserService.getRemainingQuota(user.id);
        if (remainingQuota <= 0 && user.admin !== true) throw new BadRequest('User has reached the maximum quota!');

        owner = user.id;
      }

      const instance = Service.create(body, owner);
      if (body.type === 'bedrock') Bedrock.install(instance);
      else Java.install(instance);

      return res.status(201).json({
        success: true, id: instance.id, building: true, instance,
      });
    } catch (err) {
      return next(err);
    }
  }

  static readAll(req, res, next) {
    try {
      const instances = Service.readAll();

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
