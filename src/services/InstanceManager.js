import { readFileSync } from 'fs';
import * as cheerio from 'cheerio';
import Temp from './Temp.js';
import download from '../utils/download.js';

class InstanceManager {
  static async verifyNeedUpdate(instance) {
    const info = {
      needUpdate: false, version: 0, build: 0, url: null,
    };

    if (instance.type === 'bedrock') {
      info.url = await InstanceManager.getBedrockDownloadUrl();
      info.version = InstanceManager.extractVersionFromBedrockDownloadUrl(info.url);
    } if (instance.type === 'java') {
      const {
        version = 0, build = 0,
      } = await InstanceManager.getJavaLatestVersion(instance.software);

      info.version = version;
      info.build = build;
      info.url = await InstanceManager.getJavaDownloadUrl(instance.software, version, build);
    }

    // Verify if instance needs updates
    info.needUpdate = instance.version !== info.version;
    if (!info.needUpdate && info.build) {
      info.needUpdate = Number(instance.build) !== Number(info.build);
    }
    if (!instance.installed) info.needUpdate = true;

    return info;
  }

  static async getJavaLatestVersion(software = 'vanilla') {
    if (software === 'paper') {
      const firstResponse = await (await fetch('https://api.papermc.io/v2/projects/paper')).json();
      const version = firstResponse.versions.pop();

      const secondResponse = await (await fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}/builds`)).json();
      const build = secondResponse.builds.pop()?.build;

      return { version, build };
    } if (software === 'purpur') {
      const firstResponse = await (await fetch('https://api.purpurmc.org/v2/purpur')).json();
      const version = firstResponse.versions.pop();

      const secondResponse = await (await fetch(`https://api.purpurmc.org/v2/purpur/${version}`)).json();
      const build = secondResponse.builds.latest;

      return { version, build };
    }

    // Minecraft Vanilla
    const data = await (await fetch('https://launchermeta.mojang.com/mc/game/version_manifest.json')).json();
    return { version: data.latest.release, build: 0 };
  }

  static async getJavaDownloadUrl(software = 'vanilla', version = '', build = '') {
    if (software === 'paper') {
      return `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build}/downloads/paper-${version}-${build}.jar`;
    } if (software === 'purpur') {
      return `https://api.purpurmc.org/v2/purpur/${version}/${build}/download`;
    }

    // Minecraft Vanilla
    const tempPath = Temp.create();
    await download(`${tempPath}/index.html`, 'https://www.minecraft.net/en-us/download/server');
    const html = readFileSync(`${tempPath}/index.html`, 'utf8');
    const $ = cheerio.load(html);
    const downloadUrl = $('a[aria-label="mincraft version"]').attr('href');
    Temp.delete(tempPath);
    return downloadUrl;
  }

  static async getBedrockDownloadUrl() {
    const tempPath = Temp.create();
    await download(`${tempPath}/index.html`, 'https://minecraft.net/en-us/download/server/bedrock');
    const html = readFileSync(`${tempPath}/index.html`, 'utf8');
    const $ = cheerio.load(html);

    const downloadUrl = $('a[data-platform="serverBedrockLinux"]').attr('href');
    Temp.delete(tempPath);
    return downloadUrl;
  }

  static extractVersionFromBedrockDownloadUrl(url) {
    return url.split('bedrock-server-')[1].split('.zip')[0];
  }
}

export default InstanceManager;
