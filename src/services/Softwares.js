import * as cheerio from 'cheerio';
import { readFileSync } from 'fs';
import Temp from './Temp.js';
import download from '../utils/download.js';

class Softwares {
  static async getPaperLatest() {
    const firstResponse = await (await fetch('https://api.papermc.io/v2/projects/paper')).json();
    const version = firstResponse.versions.pop();

    const secondResponse = await (await fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}/builds`)).json();
    const build = secondResponse.builds.pop()?.build;

    return { version, build };
  }

  static getPaperDownloadUrl(version, build) {
    return `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build}/downloads/paper-${version}-${build}.jar`;
  }

  static async getPurpurLatest() {
    const firstResponse = await (await fetch('https://api.purpurmc.org/v2/purpur')).json();
    const version = firstResponse.versions.pop();

    const secondResponse = await (await fetch(`https://api.purpurmc.org/v2/purpur/${version}`)).json();
    const build = secondResponse.builds.latest;

    return { version, build };
  }

  static getPurpurDownloadUrl(version, build) {
    return `https://api.purpurmc.org/v2/purpur/${version}/${build}/download`;
  }

  static async getVanillaLatest() {
    const data = await (await fetch('https://launchermeta.mojang.com/mc/game/version_manifest.json')).json();
    return { version: data.latest.release, build: null };
  }

  static async getVanillaDownloadUrl() {
    const tempPath = Temp.create();
    await download(`${tempPath}/index.html`, 'https://www.minecraft.net/en-us/download/server');
    const html = readFileSync(`${tempPath}/index.html`, 'utf8');
    const $ = cheerio.load(html);

    const downloadUrl = $('a[aria-label="mincraft version"]').attr('href');
    Temp.delete(tempPath);
    return downloadUrl;
  }
}

export default Softwares;
