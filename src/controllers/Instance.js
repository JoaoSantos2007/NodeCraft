/* eslint-disable no-new */
import Service from '../services/Instance.js';
import UserService from '../services/User.js';
import GroupService from '../services/Group.js';
import MemberService from '../services/Member.js';
import AuthService from '../services/Auth.js';
import Bedrock from '../services/Bedrock.js';
import Java from '../services/Java.js';
import { BadRequest, Unathorized, InvalidRequest } from '../errors/index.js';
import Validator from '../validators/Instance.js';
import { INSTANCES } from '../../config/settings.js';

class Instance {
  static async create(req, res, next) {
    try {
      const { body, user } = req;
      let owner;

      // if (body.group) {
      //   const group = await GroupService.readOne(body.group);

      //   // Verify if user has permission to create instance insade group
      //   const userHasPermission = await AuthService.verifyUserHasPermissionInsideGroup(group, user, 'instance:create');
      //   if (!userHasPermission) throw new Unathorized("User doesn't have this permission inside group!");

      //   // Verify Group max quota
      //   const remainingQuota = await GroupService.getRemainingQuota(group.id);
      //   if (remainingQuota <= 0) throw new BadRequest('Group has reached the maximum quota!');

      //   delete body.group;
      //   owner = group.id;
      // } else {
      //   // Verify User max quota
      //   const remainingQuota = await UserService.getRemainingQuota(user.id);
      //   if (remainingQuota <= 0 && user.admin !== true) throw new BadRequest('User has reached the maximum quota!');

      //   owner = user.id;
      // }

      Validator(body);
      const instance = await Service.create(body, user.id);
      if (body.type === 'bedrock') Bedrock.install(instance, true);
      else Java.install(instance, true);

      return res.status(201).json({
        success: true, id: instance.id, building: true, instance,
      });
    } catch (err) {
      console.log(err);
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

      // Validator(body);
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
      const { type } = instance;

      if (type === 'bedrock') new Bedrock(instance);
      else if (type === 'java') new Java(instance);
      await Service.update(id, { run: true });

      return res.status(200).json({ success: true, running: true, instance });
    } catch (err) {
      return next(err);
    }
  }

  static async stop(req, res, next) {
    try {
      const { id } = req.params;
      const instance = await Service.readOne(id);
      console.log(instance.dataValues.running, instance);
      if (!instance.dataValues.running) throw new InvalidRequest('Instance is not in progress!');

      INSTANCES[id].stop();
      await Service.update(id, { run: false });

      return res.status(200).json({ success: true, stopped: true, instance });
    } catch (err) {
      return next(err);
    }
  }

  static async updateVersion(req, res, next) {
    try {
      const { id } = req.params;
      const force = req?.query?.force === 'true';

      const instance = await Service.readOne(id);
      let info = { version: instance.version, build: instance.build, updated: false };
      const { type } = instance;

      if (type === 'bedrock') info = await Bedrock.install(instance, force);
      else if (type === 'java') info = await Java.install(instance, force);

      return res.status(200).json({
        success: true,
        version: info.version || null,
        build: info.build || null,
        msg: info.updating ? 'Updating Instance!' : 'No Update Available!',
      });
    } catch (err) {
      return next(err);
    }
  }
}

export default Instance;
