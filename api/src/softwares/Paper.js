import { BadRequest } from '../errors/index.js';
import download from '../utils/download.js';
import { INSTANCES_PATH } from '../utils/env.js';

class Paper {
  static async getVersions() {
    const response = await fetch('https://papermc.io/api/v2/projects/paper');
    const data = await response.json();

    return data.versions;
  }

  static async getBuilds(version) {
    const response = await fetch(`https://papermc.io/api/v2/projects/paper/versions/${version}`);
    const data = await response.json();

    return data.builds;
  }

  static async getLatest(version = null) {
    const versions = await Paper.getVersions();
    if (version !== 'latest' && version && !versions.includes(version)) throw new BadRequest(`version ${version} not found!`);

    const validVersion = versions.pop();
    const build = (await Paper.getBuilds(validVersion)).pop();

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
    const info = await Paper.getLatest(instance.version);
    if (!Paper.verifyNeedUpdate(instance, info)) return { ...info, updated: false };

    const downloadUrl = `https://api.papermc.io/v2/projects/paper/versions/${info.version}/builds/${info.build}/downloads/paper-${info.version}-${info.build}.jar`;
    await download(`${INSTANCES_PATH}/${instance.id}/server.jar`, downloadUrl);
    return info;
  }
}

export default Paper;
