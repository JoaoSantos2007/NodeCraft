import * as cheerio from 'cheerio';
import fs from 'fs';
import axios from 'axios';
import { BadRequest } from '../errors/index.js';
import Temp from './Temp.js';
import download from '../utils/download.js';

class Paper {
  static async getVersions() {
    const response = await axios.get('https://papermc.io/api/v2/projects/paper');

    return response.data.versions;
  }

  static async getBuilds(version) {
    const response = await axios.get(`https://papermc.io/api/v2/projects/paper/versions/${version}`);

    return response.data.builds;
  }

  static async analizeBuild(version, build) {
    const response = await axios.get(`https://papermc.io/api/v2/projects/paper/versions/${version}/builds/${build}`);

    return response.data;
  }

  static async getStableVersion() {
    const tempPath = Temp.create();

    await download(`${tempPath}/index.html`, 'https://papermc.io/downloads/paper');
    const html = fs.readFileSync(`${tempPath}/index.html`, 'utf8');
    const $ = cheerio.load(html);

    const rawObj = $('#__NEXT_DATA__').html();
    const obj = JSON.parse(rawObj);

    const version = obj.props.pageProps.project.latestStableVersion;
    Temp.delete(tempPath);
    return version;
  }

  static async getStableBuild(version) {
    const builds = await Paper.getBuilds(version);

    let index = builds.length - 1;
    while (index >= 0) {
      const buildIndex = builds[index];

      // eslint-disable-next-line no-await-in-loop
      const buildData = await Paper.analizeBuild(version, buildIndex);
      if (buildData.channel === 'default') return buildIndex;
      index -= 1;
    }

    return builds[builds.length - 1];
  }

  static async getStable() {
    const version = await Paper.getStableVersion();
    const build = await Paper.getStableBuild(version);

    return { version, build };
  }

  static async getSpecifDownloadUrl(version = null) {
    const versions = await Paper.getVersions();
    if (!versions.includes(version)) throw new BadRequest(`version ${version} not found!`);
    const build = await Paper.getStableBuild(version);

    return `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build}/downloads/paper-${version}-${build}.jar`;
  }

  static async getLatestDownloadUrl() {
    const { version, build } = await Paper.getStable();

    return `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build}/downloads/paper-${version}-${build}.jar`;
  }

  static async getDownloadUrl(version) {
    if (version) return Paper.getSpecifDownloadUrl(version);
    return Paper.getLatestDownloadUrl();
  }

  static async install(path, version) {
    const downloadUrl = await Paper.getDownloadUrl(version);
    await download(`${path}/server.jar`, downloadUrl);
  }
}

export default Paper;
