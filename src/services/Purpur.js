import shell from 'shelljs';
import curl from '../utils/curl.js';
import { BadRequest } from '../errors/index.js';

class Purpur {
  static async getVersions() {
    const response = await fetch('https://api.purpurmc.org/v2/purpur/');
    const data = await response.json();

    return data.versions;
  }

  static async getBuilds(version) {
    const response = await fetch(`https://api.purpurmc.org/v2/purpur/${version}`);
    const data = await response.json();

    return data.builds;
  }

  static async analizeBuild(version, build) {
    const response = await fetch(`https://papermc.io/api/v2/projects/paper/versions/${version}/builds/${build}`);
    const data = await response.json();

    return data;
  }

  static async getLatestBuild(version) {
    const builds = await Purpur.getBuilds(version);
    const latestBuild = builds[builds.length - 1];

    return latestBuild;
  }

  static async getLatestStableBuild(version) {
    const builds = await Purpur.getBuilds(version);

    let index = builds.length - 1;
    while (index >= 0) {
      const buildIndex = builds[index];
      // eslint-disable-next-line no-await-in-loop
      const buildData = await Purpur.analizeBuild(version, buildIndex);
      if (buildData.channel === 'default') return buildIndex;
      index -= 1;
    }

    return false;
  }

  static async getLatestStableVersionAndBuild() {
    const versions = await Purpur.getVersions();
    const latestVersion = versions[versions.length - 1];
    const latestBuild = await Purpur.getLatestBuild(latestVersion);

    let index = versions.length - 1;
    while (index >= 0) {
      const versionIndex = versions[index];
      // eslint-disable-next-line no-await-in-loop
      const latestStableBuild = await Purpur.getLatestStableBuild(versionIndex);
      if (latestStableBuild) return { version: versionIndex, build: latestStableBuild };

      index -= 1;
    }

    return { version: latestVersion, build: latestBuild };
  }

  static async getDownloadUrl(version = null) {
    if (version) {
      const versions = await Purpur.getVersions();
      if (!versions.includes(version)) throw new BadRequest(`version ${version} not found!`);
      const build = await Purpur.getLatestBuild();

      return `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build}/downloads/paper-${version}-${build}.jar`;
    }
    const latest = await Purpur.getLatestStableVersionAndBuild();
    return `https://api.papermc.io/v2/projects/paper/versions/${latest.version}/builds/${latest.build}/downloads/paper-${latest.version}-${latest.build}.jar`;
  }

  static async install(path, version) {
    const downloadUrl = await Purpur.getDownloadUrl(version);
    const downloadFile = 'server.jar';
    // Download server.jar
    shell.exec(`${curl()} -o ${path}/${downloadFile} ${downloadUrl}`, { silent: true });
  }
}

export default Purpur;
