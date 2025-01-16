/* eslint-disable no-new */
import { readFileSync, writeFileSync } from 'fs';
import * as cheerio from 'cheerio';
import AdmZip from 'adm-zip';
import { INSTANCES_PATH } from '../../config/settings.js';
import NodeCraft from './NodeCraft.js';
import Temp from './Temp.js';
import download from '../utils/download.js';
import List from './List.js';
import Instance from './Instance.js';

class Bedrock extends Instance {
  constructor(settings) {
    super(settings, 'bedrock');
    this.setup();
  }

  static async verifyNeedUpdate(instance) {
    const url = await Bedrock.getUrl();
    const version = Bedrock.extractVersion(url);
    let needUpdate = false;

    if (!instance.installed) needUpdate = true;
    else if (instance.disableUpdate) needUpdate = false;
    else needUpdate = instance.version !== version;

    return { needUpdate, version, url };
  }

  static async install(instance, force = false) {
    // Verify if instance needUpdates
    const { needUpdate, version, url } = await Bedrock.verifyNeedUpdate(instance);
    if (!needUpdate && !force) return { version, updated: false };

    // Install and unzip
    const instancePath = `${INSTANCES_PATH}/${instance.id}`;
    const tempPath = Temp.create();

    // Start the download process in the background
    download(`${tempPath}/bedrock.zip`, url).then(async () => {
      // Stop Instance for update
      await Instance.stopAndWait(instance.id);

      const zip = new AdmZip(`${tempPath}/bedrock.zip`);
      zip.extractAllTo(instancePath, true);
      Temp.delete(tempPath);
      NodeCraft.update(instance.id, { version, installed: true });

      // Restart instance if necessary
      if (instance.run) new Bedrock(instance);
    });

    // Return the immediate response
    return { version, updating: true };
  }

  static async getUrl() {
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
    List.sync(this.path, this.settings);
    this.wipePrivileges();
    this.updateAccess();
    this.run();
    this.handleServerEvents();
  }

  handleServerEvents() {
    this.terminal.stdout.on('data', (data) => {
      this.updateHistory(data);
      this.verifyPlayerConnected(data);
      this.verifyPlayerSpawned(data);
      this.verifyPlayerDisconnected(data);
      this.verifyServerIsDone(data);
    });
  }

  updateAccess() {
    const playersValues = this.readPlayers();
    const allowlist = [];
    playersValues.forEach((player) => {
      if (player.access === 'always' && !player.admin) allowlist.push({ ignoresPlayerLimit: false, name: player.gamertag });
      if (player.admin) allowlist.push({ ignoresPlayerLimit: true, name: player.gamertag });
      if (player.access === 'monitored' && this.admins > 0) allowlist.push({ ignoresPlayerLimit: false, name: player.gamertag });
      if (player.access === 'monitored' && this.admins <= 0 && this.players.includes(player.gamertag)) this.emitEvent(`kick ${player.gamertag}`);
    });

    writeFileSync(`${this.path}/allowlist.json`, JSON.stringify(allowlist), 'utf8');
  }

  verifyPlayerConnected(output) {
    if (output.includes('Player connected')) {
      const gamertag = (output.split('] Player connected: ')[1]).split(',')[0];
      this.online += 1;
      this.players.push(gamertag);

      if (this.verifyPlayerIsAdmin(gamertag)) {
        this.admins += 1;
        this.updateAccess();
      }
    }
  }

  verifyPlayerSpawned(output) {
    if (output.includes('Player Spawned')) {
      const gamertag = (output.split('] Player Spawned: ')[1]).split(' xuid')[0];

      this.verifyPrivileges(gamertag);
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

  verifyPrivileges(gamertag) {
    this.readPlayers().forEach((player) => {
      if (player.gamertag === gamertag && player.operator) {
        this.emitEvent(`op ${gamertag}`);
      }
    });
  }

  verifyServerIsDone(output) {
    if (output.includes('Server started') && this.isDone === false) {
      this.isDone = true;
    }
  }
}

export default Bedrock;
