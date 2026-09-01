import { InvalidRequest, NotFound } from '../errors/index.js';
import { Roster as Model, Instance as InstanceModel } from '../models/index.js';
import resolvers from '../utils/resolvers.js';
import config from '../../config/config.js';

class Roster {
  static async readAllByInstance(instanceId) {
    const rosters = await Model.findAll({
      where: { instanceId },
    });

    return rosters;
  }

  static async readOne(instanceId, rosterId) {
    const roster = await Model.findOne({
      where: {
        id: rosterId,
        instanceId,
      },
    });

    if (!roster) throw new NotFound('Roster not found!');

    return roster;
  }

  static async create(id, data) {
    await Roster.assertPlatformAllowed(id, data.platform);

    const { identifier, name } = await Roster.resolve(data.platform, data.name);

    const roster = await Model.create({
      instanceId: id,
      identifier,
      platform: data.platform,
      name,
      access: data.access,
      privileged: data.privileged,
    });

    return roster;
  }

  static async update(instanceId, rosterId, data) {
    const roster = await Roster.readOne(instanceId, rosterId);
    await roster.update(data);

    return roster;
  }

  static async delete(instanceId, rosterId) {
    const roster = await Roster.readOne(instanceId, rosterId);
    await roster.destroy();

    return roster;
  }

  static async assertPlatformAllowed(instanceId, platform) {
    const instance = await InstanceModel.findByPk(instanceId);
    if (!instance) throw new NotFound('Instance not found!');

    const allowed = config.roster.platformsByGame[instance.type] || config.roster.platforms;
    if (!allowed.length) {
      throw new InvalidRequest(`The roster is not available for ${instance.type}!`);
    }

    if (!allowed.includes(platform)) {
      throw new InvalidRequest(`Platform "${platform}" is not available for ${instance.type}!`);
    }
  }

  static async resolve(platform, input) {
    const resolver = resolvers[platform];
    if (!resolver) throw new InvalidRequest(`Unsupported platform: ${platform}`);

    return resolver(input);
  }
}

export default Roster;
