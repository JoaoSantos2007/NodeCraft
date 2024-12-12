import * as cheerio from 'cheerio';
import { readFileSync } from 'fs';
import Temp from '../services/Temp.js';
import download from '../utils/download.js';
import { INSTANCES_PATH } from '../utils/env.js';

class Vanilla {
  static async getDownloadUrl() {
    const tempPath = Temp.create();
    await download(`${tempPath}/index.html`, 'https://www.minecraft.net/en-us/download/server');
    const html = readFileSync(`${tempPath}/index.html`, 'utf8');
    const $ = cheerio.load(html);

    const downloadUrl = $('a[aria-label="mincraft version"]').attr('href');
    Temp.delete(tempPath);
    return downloadUrl;
  }

  static async getLatestVersion() {
    const response = await fetch('https://launchermeta.mojang.com/mc/game/version_manifest.json');
    const data = await response.json();

    if (data && data.latest && data.versions) {
      const latestVersion = data.latest.release;

      // eslint-disable-next-line no-restricted-syntax
      for (const version of data.versions) {
        if (version.id === latestVersion && version.type === 'release') {
          return version.id;
        }
      }
    }

    return 0;
  }

  static verifyNeedUpdate(instance, version) {
    const { installed, disableUpdate } = instance;

    if (!installed) return true;
    return (!disableUpdate && (instance.version !== version));
  }

  static async install(instance) {
    const version = await Vanilla.getLatestVersion();
    const info = { version, build: null };
    if (!Vanilla.verifyNeedUpdate(instance, version)) return { ...info, updated: false };

    const downloadUrl = await Vanilla.getDownloadUrl();
    await download(`${INSTANCES_PATH}/${instance.id}/server.jar`, downloadUrl);
    return info;
  }
}

export default Vanilla;
