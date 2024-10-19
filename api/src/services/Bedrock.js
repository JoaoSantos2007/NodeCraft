import shell from 'shelljs';
import { readFileSync, writeFileSync } from 'fs';
import * as cheerio from 'cheerio';
import { INSTANCES_PATH } from '../utils/env.js';
import NodeCraft from './NodeCraft.js';
import Temp from './Temp.js';
import download from '../utils/download.js';
import { syncLists } from '../utils/Properties.js';
import Instance from './Instance.js';

class Bedrock extends Instance {
  constructor(settings) {
    super(settings, 'bedrock');
    this.setup();
  }

  static verifyNeedUpdate(latestVersion, instance) {
    const { installed, version, disableUpdate } = instance;

    if (!installed) return true;
    return (!disableUpdate && version !== latestVersion);
  }

  static async install(instance) {
    const downloadUrl = await Bedrock.getDownloadUrl();
    const latestVersion = Bedrock.extractVersion(downloadUrl);
    const info = { version: latestVersion, build: null };
    if (!Bedrock.verifyNeedUpdate(latestVersion, instance)) return { ...info, updated: false };

    // Install and unzip
    const instancePath = `${INSTANCES_PATH}/${instance.id}`;
    const tempPath = Temp.create();
    await download(`${tempPath}/bedrock.zip`, downloadUrl);
    shell.exec(`unzip -o ${tempPath}/bedrock.zip -d ${instancePath}`, { silent: true });

    Temp.delete(tempPath);
    NodeCraft.update(instance.id, { version: latestVersion, build: null, installed: true });

    return info;
  }

  static async getDownloadUrl() {
    const tempPath = Temp.create();
    await download(`${tempPath}/index.html`, 'https://minecraft.net/en-us/download/server/bedrock');
    const html = readFileSync(`${tempPath}/index.html`, 'utf8');
    const $ = cheerio.load(html);

    const downloadUrl = $('a[data-platform="serverBedrockLinux"]').attr('href');
    Temp.delete(tempPath);
    return downloadUrl;
  }

  static extractVersion(url) {
    return url.split('bedrock-server-')[1].split('.zip')[0];
  }

  setup() {
    syncLists(this.path, this.settings);
    this.wipePrivileges();
    this.updateAccess();
    this.run();
    this.handleServerEvents();
  }

  handleServerEvents() {
    this.terminal.stdout.on('data', (data) => {
      this.updateHistory(data);
      this.verifyPlayerConnected(data);
      this.verifyPlayerDisconnected(data);
    });
  }

  updateAccess() {
    const playersValues = this.readPlayers();
    const allowlist = [];
    playersValues.forEach((player) => {
      if (player.access === 'always' && !player.admin) allowlist.push({ ignoresPlayerLimit: false, name: player.gamertag });
      if (player.admin) allowlist.push({ ignoresPlayerLimit: true, name: player.gamertag });
      if (player.access === 'monitored' && this.admins > 0) allowlist.push({ ignoresPlayerLimit: false, name: player.gamertag });
      if (player.access === 'monitored' && this.admins < 0 && this.players.includes(player.gamertag)) this.emitEvent(`kick ${player.gamertag}`);
    });

    writeFileSync(`${this.path}/allowlist.json`, JSON.stringify(allowlist), 'utf8');
  }

  verifyPlayerConnected(output) {
    if (output.includes('Player connected')) {
      const gamertag = (output.split('] Player connected: ')[1]).split(',')[0];
      const xuid = (output.split('xuid: ')[1]).split('\n')[0];
      this.online += 1;
      this.players.push(gamertag);

      if (this.verifyPlayerIsAdmin(gamertag)) {
        this.admins += 1;
        this.updateAccess();
      }

      this.verifyPrivileges(gamertag, xuid);
    }
  }

  verifyPlayerDisconnected(output) {
    if (output.includes('Player disconnected')) {
      const gamertag = (output.split('] Player disconnected: ')[1]).split(',')[0];
      this.online -= 1;
      this.players.splice(this.players.indexOf(gamertag), 1);

      if (this.verifyPlayerIsAdmin(gamertag)) {
        this.admins -= 1;
        this.updateAccess();
      }
    }
  }

  wipePrivileges() {
    writeFileSync(`${this.path}/permissions.json`, '[]', 'utf8');
  }

  verifyPrivileges(gamertag, xuid) {
    this.readPlayers().forEach((player) => {
      if (player.gamertag === gamertag && player.operator) {
        const rawData = readFileSync(`${this.path}/permissions.json`, 'utf8');
        const permissions = JSON.parse(rawData);

        let alreadyInList = false;
        permissions.forEach((obj) => {
          if (Number(obj.xuid) === Number(xuid)) alreadyInList = true;
        });

        if (!alreadyInList) {
          permissions.push({ permission: 'operator', xuid });
          writeFileSync(`${this.path}/permissions.json`, JSON.stringify(permissions), 'utf8');
        }
      }
    });
  }
}

export default Bedrock;
