import { BadRequest } from '../errors/index.js';
import NodeCraft from '../services/NodeCraft.js';
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

  static async verifyNeedUpdate(instance) {
    const latest = await Purpur.getLatest();
    const info = { version: latest.version, build: latest.build };
    let needUpdated;

    if (!instance.installed) needUpdated = true;
    else if (instance.disableUpdate) needUpdated = false;
    else {
      needUpdated = instance.version !== latest.version
      || Number(instance.build) !== Number(latest.build);
    }

    return { needUpdated, info };
  }

  static async install(instance, isUpdate = false) {
    const { needUpdate, info } = await Purpur.verifyNeedUpdate(instance);
    if (!needUpdate) return { ...info, updated: false };

    const downloadUrl = `https://api.purpurmc.org/v2/purpur/${info.version}/${info.build}/download`;

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

export default Purpur;
