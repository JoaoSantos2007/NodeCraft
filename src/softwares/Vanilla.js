import * as cheerio from 'cheerio';
import { readFileSync } from 'fs';
import Temp from '../services/Temp.js';
import download from '../utils/download.js';
import { INSTANCES_PATH } from '../../config/settings.js';
import NodeCraft from '../services/NodeCraft.js';

class Vanilla {
  static async getUrl() {
    const tempPath = Temp.create();
    await download(`${tempPath}/index.html`, 'https://www.minecraft.net/en-us/download/server');
    const html = readFileSync(`${tempPath}/index.html`, 'utf8');
    const $ = cheerio.load(html);

    const downloadUrl = $('a[aria-label="mincraft version"]').attr('href');
    Temp.delete(tempPath);
    return downloadUrl;
  }

  static async getLatest() {
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

  static async verifyNeedUpdate(instance) {
    const version = await Vanilla.getLatest();
    let needUpdate = false;

    if (!instance.installed) needUpdate = true;
    else if (instance.disableUpdate) needUpdate = false;
    else needUpdate = instance.version !== version;

    return { needUpdate, version };
  }

  static async install(instance, isUpdate = false, force = false) {
    const { needUpdate, version } = await Vanilla.verifyNeedUpdate(instance);
    if (!needUpdate && !force) return { version, updated: false };

    const downloadUrl = await Vanilla.getUrl();

    if (isUpdate) {
      // Start the download process in the background
      download(`${INSTANCES_PATH}/${instance.id}/server.jar`, downloadUrl).then(() => {
        // Update the instance info after download completes
        NodeCraft.update(instance.id, {
          version,
          installed: true,
        });
      });

      // Return the immediate response
      return { version, updating: true };
    }

    // Wait for the download to complete
    await download(`${INSTANCES_PATH}/${instance.id}/server.jar`, downloadUrl);

    // Update the instance info after download completes
    NodeCraft.update(instance.id, { version, installed: true });

    return { version, updated: true };
  }
}

export default Vanilla;
