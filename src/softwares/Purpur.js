import { BadRequest } from '../errors/index.js';
import download from '../utils/download.js';
import { INSTANCES_PATH } from '../utils/env.js';

class Purpur {
  static async getVersions() {
    const response = await fetch('https://api.purpurmc.org/v2/purpur/');
    const data = await response.json();

    return data.versions;
  }

  static async getBuilds(version) {
    const response = await fetch(`https://api.purpurmc.org/v2/purpur/${version}`);
    const data = await response.json();

    return data.builds.all;
  }

  static async getLatest(version) {
    const versions = await Purpur.getVersions();
    if (version !== 'latest' && version && !versions.includes(version)) throw new BadRequest(`version ${version} not found!`);

    const validVersion = versions.pop();
    const build = (await Purpur.getBuilds(validVersion)).pop();

    return { version: validVersion, build };
  }

  static verifyNeedUpdate(instance, latest) {
    const {
      installed, version, build, disableUpdate,
    } = instance;

    if (!installed) return true;

    return (!disableUpdate
      && (version !== latest.version || Number(build) !== Number(latest.build)));
  }

  static async install(instance) {
    const info = await Purpur.getLatest(instance.version);
    if (!Purpur.verifyNeedUpdate(instance, info)) return { ...info, updated: false };

    const downloadUrl = `https://api.purpurmc.org/v2/purpur/${info.version}/${info.build}/download`;
    await download(`${INSTANCES_PATH}/${instance.id}/server.jar`, downloadUrl);
    return info;
  }
}

export default Purpur;
