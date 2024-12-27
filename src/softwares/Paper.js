import { BadRequest } from '../errors/index.js';
import download from '../utils/download.js';
import NodeCraft from '../services/NodeCraft.js';
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

  static async verifyNeedUpdate(instance) {
    const latest = await Paper.getLatest();
    const info = { version: latest.version, build: latest.build };
    let needUpdate = false;

    if (!instance.installed) needUpdate = true;
    else if (instance.disableUpdate) needUpdate = false;
    else {
      needUpdate = instance.version !== latest.version
      || Number(instance.build) !== Number(latest.build);
    }

    return { needUpdate, info };
  }

  static async install(instance, isUpdate = false, force = false) {
    const { needUpdate, info } = await Paper.verifyNeedUpdate(instance);
    if (!needUpdate && !force) return { ...info, updated: false };

    const downloadUrl = `https://api.papermc.io/v2/projects/paper/versions/${info.version}/builds/${info.build}/downloads/paper-${info.version}-${info.build}.jar`;

    if (isUpdate) {
      // Start the download process in the background
      download(`${INSTANCES_PATH}/${instance.id}/server.jar`, downloadUrl).then(() => {
        // Update the instance info after download completes

        NodeCraft.update(instance.id, {
          version: info.version,
          build: info.build,
          installed: true,
        });
      });

      // Return the immediate response
      return { ...info, updating: true };
    }

    // Wait for the download to complete
    await download(`${INSTANCES_PATH}/${instance.id}/server.jar`, downloadUrl);

    // Update the instance info after download completes
    NodeCraft.update(instance.id, { version: info.version, build: info.build, installed: true });

    return { ...info, updated: true };
  }
}

export default Paper;
