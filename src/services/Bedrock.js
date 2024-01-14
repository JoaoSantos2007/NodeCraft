import shell from 'shelljs';
import {
  existsSync, mkdirSync, readFileSync, rmSync, writeFileSync,
} from 'fs';
import * as cheerio from 'cheerio';
import { BadRequest } from '../errors/index.js';
import { INSTANCES_PATH } from '../utils/env.js';
import NodeCraft from './NodeCraft.js';
import Temp from './Temp.js';
import download from '../utils/download.js';
import { syncPropertiesLists } from '../utils/Properties.js';
import Instance from './Instance.js';

class Bedrock extends Instance {
  constructor(settings) {
    super(settings);
    this.setup();
  }

  static async create(id) {
    const version = await Bedrock.install(`${INSTANCES_PATH}/${id}`);
    return NodeCraft.create(id, version, 'bedrock');
  }

  static async update(instance) {
    const instancePath = `${INSTANCES_PATH}/${instance.id}`;

    const downloadUrl = await Bedrock.getDownloadUrl();
    const latestVersion = Bedrock.extractVersion(downloadUrl);
    if (latestVersion === instance.version) return { updated: false, version: instance.version };

    await Bedrock.install(instancePath, downloadUrl);
    const instanceUpdated = instance;
    instanceUpdated.version = latestVersion;
    NodeCraft.save(instanceUpdated);

    return { updated: true, version: latestVersion };
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

  static async install(path, url = null) {
    const tempPath = Temp.create();
    const downloadUrl = url || await Bedrock.getDownloadUrl();

    // Install and unzip
    await download(`${tempPath}/bedrock.zip`, downloadUrl);
    shell.exec(`unzip -o ${tempPath}/bedrock.zip -d ${path}`, { silent: true });

    Temp.delete(tempPath);
    return Bedrock.extractVersion(downloadUrl);
  }

  static async downloadWorld(instance) {
    const worldPath = `${INSTANCES_PATH}/${instance.id}/worlds`;
    const worldName = instance.properties['level-name'];
    const world = `${worldPath}/${worldName}`;

    if (!existsSync(world)) throw new BadRequest('World not found!');
    const file = `${worldPath}/world.mcworld`;
    // Zip world path
    shell.exec(`cd ${world} && zip -rFS ${file} .`, { silent: true });

    return file;
  }

  static async uploadWorld(instance, uploadPath) {
    const uploadFile = `${uploadPath}/upload.zip`;
    const worldsPath = `${INSTANCES_PATH}/${instance.id}/worlds`;
    if (!existsSync(worldsPath)) mkdirSync(worldsPath);

    const worldName = instance.properties['level-name'];
    const world = `${worldsPath}/${worldName}`;
    if (existsSync(world)) rmSync(world, { recursive: true });

    // Unzip uploaded world
    shell.exec(`unzip ${uploadFile} -d ${world}`, { silent: true });
    Temp.delete(uploadPath);

    return instance;
  }

  static async deleteWorld(instance) {
    const worldsPath = `${INSTANCES_PATH}/${instance.id}/worlds`;
    if (!existsSync(worldsPath)) return;

    const worldName = instance.properties['level-name'];
    const world = `${worldsPath}/${worldName}`;
    if (existsSync(world)) rmSync(world, { recursive: true });
  }

  setup() {
    this.wipePrivileges();
    this.updateAccess();
    syncPropertiesLists(this.path, this.settings);
    this.run();
    this.handleServerEvents();
  }

  updateAccess() {
    const playersValues = this.readPlayers();
    const allowlist = [];
    playersValues.forEach((player) => {
      if (player.access === 'always' && !player.admin) allowlist.push({ ignoresPlayerLimit: false, name: player.gamertag });
      if (player.admin) allowlist.push({ ignoresPlayerLimit: true, name: player.gamertag });
      if (player.access === 'monitored' && this.admins > 0) allowlist.push({ ignoresPlayerLimit: false, name: player.gamertag });
    });

    writeFileSync(`${this.path}/allowlist.json`, JSON.stringify(allowlist), 'utf8');
  }

  run() {
    this.terminal = shell.exec(`cd ${this.path} && ./bedrock_server`, { silent: false, async: true });
  }

  stop() {
    this.emitEvent('stop');
  }

  emitEvent(cmd) {
    if (this.terminal) this.terminal.stdin.write(`${cmd} \n`);
  }

  handleServerEvents() {
    this.terminal.stdout.on('data', (data) => {
      this.updateHistory(data);
      this.verifyPlayerConnected(data);
      this.verifyPlayerDisconnected(data);
    });
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
