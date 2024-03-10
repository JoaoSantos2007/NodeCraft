/* eslint-disable consistent-return */
import * as cheerio from 'cheerio';
import { readFileSync } from 'fs';
import Temp from '../services/Temp.js';
import { BadRequest } from '../errors/index.js';
import download from '../utils/download.js';
import compareVersions from '../utils/compareVersions.js';

class Forge {
  static async getStable() {
    const tempPath = Temp.create();
    await download(`${tempPath}/index.html`, 'https://files.minecraftforge.net/net/minecraftforge/forge/');
    const html = readFileSync(`${tempPath}/index.html`, 'utf8');
    const $ = cheerio.load(html);

    const downloads = $('.downloads');
    let versionText = '';
    downloads.each((i, el) => {
      const downloadDiv = $(el).find('.download');

      const recommendedTitle = downloadDiv.find('.title:contains("Download Recommended")');
      const latestTitle = downloadDiv.find('.title:contains("Download Latest")');

      if (recommendedTitle.length > 0) {
        versionText = recommendedTitle.find('small').html().trim();
        return false;
      } if (latestTitle.length > 0) {
        versionText = latestTitle.find('small').html().trim();
      }
    });

    const version = versionText.split(' -')[0];
    const build = versionText.split('- ')[1];
    Temp.delete(tempPath);
    return { version, build };
  }

  static async getStableDownloadUrl() {
    const { version, build } = await Forge.getStable();
    return `https://maven.minecraftforge.net/net/minecraftforge/forge/${version}-${build}/forge-${version}-${build}-installer.jar`;
  }

  static async getVersions() {
    const tempPath = Temp.create();
    await download(`${tempPath}/index.html`, 'https://files.minecraftforge.net/net/minecraftforge/forge/');
    const html = readFileSync(`${tempPath}/index.html`, 'utf8');
    const $ = cheerio.load(html);
    const versions = [];

    const versionList = $('.nav-collapsible > li').find('a');
    versionList.each((i, el) => {
      const versionText = $(el).text().trim();
      if (compareVersions('1.12', versionText)) {
        versions.push(versionText);
      }
    });

    Temp.delete(tempPath);
    return versions;
  }

  static async getBuild(version) {
    const tempPath = Temp.create();
    await download(`${tempPath}/index.html`, `https://files.minecraftforge.net/net/minecraftforge/forge/index_${version}.html`);
    const html = readFileSync(`${tempPath}/index.html`, 'utf8');
    const $ = cheerio.load(html);

    const downloads = $('.downloads');
    let versionText = '';
    downloads.each((i, el) => {
      const downloadDiv = $(el).find('.download');

      const recommendedTitle = downloadDiv.find('.title:contains("Download Recommended")');
      const latestTitle = downloadDiv.find('.title:contains("Download Latest")');

      if (recommendedTitle.length > 0) {
        versionText = recommendedTitle.find('small').html().trim();
        return false;
      } if (latestTitle.length > 0) {
        versionText = latestTitle.find('small').html().trim();
      }
    });

    Temp.delete(tempPath);
    return versionText.split('- ')[1];
  }

  static async getSpecifDownloadUrl(version) {
    const versions = await Forge.getVersions();
    if (!versions.includes(version)) throw new BadRequest(`version ${version} not found!`);

    const build = await Forge.getBuild(version);
    return `https://maven.minecraftforge.net/net/minecraftforge/forge/${version}-${build}/forge-${version}-${build}-installer.jar`;
  }

  static async getDownloadUrl(version) {
    if (version) return Forge.getSpecifDownloadUrl(version);
    return Forge.getStableDownloadUrl();
  }

  static extractBuildAndVersion(url) {
    const info = url.split('forge-')[1].split('-installer.jar')[0].split('-');
    return { version: info[0], build: info[1] };
  }

  static async install(path, version) {
    const downloadUrl = await Forge.getDownloadUrl(version);
    const info = Forge.extractBuildAndVersion(downloadUrl);
    await download(`${path}/forge.jar`, downloadUrl);

    return info;
  }
}

export default Forge;
