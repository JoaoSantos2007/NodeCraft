import * as cheerio from 'cheerio';
import { readFileSync } from 'fs';
import { BadRequest } from '../errors/index.js';
import Temp from '../services/Temp.js';
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

  static async analizeBuild(version, build) {
    const response = await fetch(`https://api.purpurmc.org/v2/purpur/${version}/${build}`);
    const data = await response.json();

    return data;
  }

  static async getStableVersion() {
    const tempPath = Temp.create();

    await download(`${tempPath}/index.html`, 'https://purpurmc.org/downloads');
    const html = readFileSync(`${tempPath}/index.html`, 'utf8');
    const $ = cheerio.load(html);

    const dropdown = $('#dropdown');
    const selectedVersion = dropdown.find('option[selected]');
    const version = selectedVersion.attr('value');

    Temp.delete(tempPath);
    return version;
  }

  static async getLatestBuild(version) {
    const response = await fetch(`https://api.purpurmc.org/v2/purpur/${version}`);
    const data = await response.json();

    return data.builds.latest;
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

  static async extractBuildAndVersion(url) {
    const info = url.split('purpur/')[1].split('/download')[0].split('/');

    return { version: info[0], build: info[1] };
  }

  static async install(path, version) {
    const downloadUrl = await Purpur.getDownloadUrl(version);
    const info = Purpur.extractBuildAndVersion(downloadUrl);
    await download(`${path}/server.jar`, downloadUrl);

    return info;
  }

  static async update(instance) {
    const { version, build } = await Purpur.getStable();
    if (instance.version === version || instance.build === build) return { version, build };

    return Purpur.install(`${INSTANCES_PATH}/${instance.id}`);
  }
}

export default Purpur;
