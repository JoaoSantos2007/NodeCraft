/* eslint-disable no-new */
import Service from '../services/Instance.js';
import UserService from '../services/User.js';
import GroupService from '../services/Group.js';
import MemberService from '../services/Member.js';
import AuthService from '../services/Auth.js';
import { BadRequest, Unathorized, InvalidRequest } from '../errors/index.js';
import Validator from '../validators/Instance.js';
import { INSTANCES_PATH, INSTANCES } from '../../config/settings.js';
import ListService from '../services/List.js';

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

      Validator(body, false, true);
      const instance = await Service.create(body, owner);
      Service.install(instance, true);

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

      if (user.admin === true) instances = await Service.readAll();
      else {
        const groupsId = await MemberService.readAllGroupsByUser(user.id);
        allOwners = allOwners.concat(groupsId);

        instances = await Service.readAllByOwners(allOwners);
      }

      return res.status(200).json({ success: true, instances });
    } catch (err) {
      return next(err);
    }
  }

  static async readOne(req, res, next) {
    try {
      const { id } = req.params;
      const instance = await Service.readOne(id);

      return res.status(200).json({ success: true, instance });
    } catch (err) {
      return next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { body } = req;

      Validator(body, true);
      const instance = await Service.update(id, body);

      return res.status(200).json({ success: true, updated: true, instance });
    } catch (err) {
      return next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const instance = await Service.delete(id);

      return res.status(200).json({ success: true, deleted: true, instance });
    } catch (err) {
      return next(err);
    }
  }

  static async run(req, res, next) {
    try {
      const { id } = req.params;
      const instance = await Service.readOne(id);

      new Service(instance);

      return res.status(200).json({ success: true, running: true, instance });
    } catch (err) {
      return next(err);
    }
  }

  static async stop(req, res, next) {
    try {
      const { id } = req.params;
      const instance = await Service.readOne(id);
      if (!instance.running && instance.pid === 0 && !INSTANCES[id]) throw new InvalidRequest('Instance is not in progress!');

      if (INSTANCES[id]) INSTANCES[id].stop();
      else if (instance.pid) Service.stopAndWait(instance.id);

      return res.status(200).json({ success: true, stopping: true, instance });
    } catch (err) {
      return next(err);
    }
  }

  static async updateVersion(req, res, next) {
    try {
      const { id } = req.params;
      const force = req?.query?.force === 'true';
      const instance = await Service.readOne(id);
      const { info, updating } = await Service.install(instance, force);

      return res.status(200).json({
        success: true,
        version: info.instanceVersion || null,
        msg: updating ? 'Updating!' : 'No Update Available!',
        info,
      });
    } catch (err) {
      return next(err);
    }
  }

  static async redefineProperties(req, res, next) {
    try {
      const { id } = req.params;
      const instance = await Service.readOne(id);

      ListService.redefine(`${INSTANCES_PATH}/${instance.id}`, instance);

      return res.status(200).json({ success: true, redefined: true });
    } catch (err) {
      return next(err);
    }
  }

  static async remapPort(req, res, next) {
    try {
      const { id } = req.params;
      const port = await Service.selectPort();
      const instance = await Service.update(id, { port });

      return res.status(200).json({
        success: true, remapped: true, port, instance,
      });
    } catch (err) {
      return next(err);
    }
  }

  static async remapAllPorts(req, res, next) {
    try {
      const instances = await Service.readAll();

      instances.forEach(async (instance) => {
        const port = await Service.selectPort();
        await Service.update(instance.id, { port });
      });

      return res.status(200).json({ success: true, remapped: true });
    } catch (err) {
      return next(err);
    }
  }
}

export default Instance;
