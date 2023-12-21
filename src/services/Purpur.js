import * as cheerio from 'cheerio';
import fs from 'fs';
import axios from 'axios';
import { BadRequest } from '../errors/index.js';
import Temp from './Temp.js';
import download from '../utils/download.js';

class Purpur {
  static async getVersions() {
    const response = await axios.get('https://api.purpurmc.org/v2/purpur/');

    return response.data.versions;
  }

  static async getBuilds(version) {
    const response = await axios.get(`https://api.purpurmc.org/v2/purpur/${version}`);

    return response.data.builds.all;
  }

  static async analizeBuild(version, build) {
    const response = await axios.get(`https://api.purpurmc.org/v2/purpur/${version}/${build}`);

    return response.data;
  }

  static async getStableVersion() {
    const tempPath = Temp.create();

    await download(`${tempPath}/index.html`, 'https://purpurmc.org/downloads');
    const html = fs.readFileSync(`${tempPath}/index.html`, 'utf8');
    const $ = cheerio.load(html);

    const dropdown = $('#dropdown');
    const selectedVersion = dropdown.find('option[selected]');
    const version = selectedVersion.attr('value');

    Temp.delete(tempPath);
    return version;
  }

  static async getLatestBuild(version) {
    const response = await axios.get(`https://api.purpurmc.org/v2/purpur/${version}`);

    return response.data.builds.latest;
  }

  static async getStable() {
    const version = await Purpur.getStableVersion();
    const build = await Purpur.getLatestBuild(version);

    return { version, build };
  }

  static async getSpecifDownloadUrl(version = null) {
    const versions = await Purpur.getVersions();
    if (!versions.includes(version)) throw new BadRequest(`version ${version} not found!`);
    const build = await Purpur.getLatestBuild(version);

    return `https://api.purpurmc.org/v2/purpur/${version}/${build}/download`;
  }

  static async getLatestDownloadUrl() {
    const { version, build } = await Purpur.getStable();

    return `https://api.purpurmc.org/v2/purpur/${version}/${build}/download`;
  }

  static async getDownloadUrl(version) {
    if (version) return Purpur.getSpecifDownloadUrl(version);
    return Purpur.getLatestDownloadUrl();
  }

  static async install(path, version) {
    const downloadUrl = await Purpur.getDownloadUrl(version);
    await download(`${path}/server.jar`, downloadUrl);
  }
}

export default Purpur;
