import shell from 'shelljs';
import crypto from 'crypto';
import fs from 'fs';
import curl from '../utils/curl.js';
import Propreties from '../utils/Properties.js';

const absolutePath = shell.pwd().stdout;
const tempsPath = `${absolutePath}/temp`;
const instancesPath = `${absolutePath}/instances/java`;

class Java {
  constructor(saved) {
    this.saved = saved;
    this.path = `${instancesPath}/${saved.name}`;
    this.online = 0;
    this.admins = [];
    this.players = [];
    this.setup();
  }

  static async createInstance(instance) {
    const { name } = instance;
    // Create New Instance Path
    const newInstancePath = `${instancesPath}/${name}`;
    shell.mkdir(newInstancePath);

    // Create Temp path
    const randomUUID = crypto.randomUUID();
    const tempPath = `${tempsPath}/${randomUUID}`;
    shell.mkdir(tempPath);

    // Get Minecraft Java Download Url
    shell.touch(`${tempPath}/version.html`);
    shell.exec(`${curl()} -o ${tempPath}/version.html https://www.minecraft.net/en-us/download/server`, { silent: true });
    const DownloadURL = shell.exec(`grep -o 'https://piston-data.mojang.com/v1/objects/[^"]*' ${tempPath}/version.html`, { silent: true }).stdout;

    // Download Minecraft server.jar
    const DownloadFile = 'server.jar';
    shell.exec(`${curl()} -o ${newInstancePath}/${DownloadFile} ${DownloadURL}`, { silent: true });

    // Delete temp path
    shell.rm('-r', tempPath);

    // First Run
    shell.exec(`cd ${newInstancePath} && java -Xmx1024M -Xms1024M -jar server.jar nogui`, { silent: true });

    // Enable eula.txt
    fs.writeFileSync(`${newInstancePath}/eula.txt`, 'eula=true');
  }

  static async deleteInstance(name) {
    shell.exec(`rm -r ${instancesPath}/${name}`, { silent: true });
  }

  setup() {
    Propreties.syncPropertiesLists('java', this.path, this.saved);
    this.run();
    this.handleServerEvents();
  }

  run() {
    this.terminal = shell.exec(`cd ${this.path} && java -Xmx1024M -Xms1024M -jar server.jar nogui`, { silent: false, async: true });
  }

  stop() {
    this.emitEvent('/stop');
  }

  emitEvent(cmd) {
    if (this.terminal) this.terminal.stdin.write(`${cmd}\n`);
  }

  handleServerEvents() {
    this.terminal.stdout.on('data', (data) => {
      // this.verifyPlayerConnected(data);
      // this.verifyPlayerDisconnected(data);
    });
  }
}

export default Java;
