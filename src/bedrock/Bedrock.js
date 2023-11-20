import shell from 'shelljs';
import crypto from 'crypto';
import curl from '../utils/curl.js';
import Propreties from '../utils/Properties.js';

const absolutePath = shell.pwd().stdout;
const tempsPath = `${absolutePath}/temp`;
const instancesPath = `${absolutePath}/instances/bedrock`;

class Bedrock {
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

    // Get Minecraft Bedrock Download Url
    shell.touch(`${tempPath}/version.html`);
    shell.exec(`${curl()} -o ${tempPath}/version.html https://minecraft.net/en-us/download/server/bedrock/`, { silent: true });
    const DownloadURL = shell.exec(`grep -o 'https://minecraft.azureedge.net/bin-linux/[^"]*' ${tempPath}/version.html`, { silent: true }).stdout;

    // Download Minecraft Bedrock .zip
    const DownloadFile = 'bedrock-server-latest.zip';
    shell.exec(`${curl()} -o ${tempPath}/${DownloadFile} ${DownloadURL}`, { silent: true });

    // Unzip File
    shell.exec(`unzip ${tempPath}/${DownloadFile} -d ${newInstancePath}`, { silent: true });

    // Delete temp path
    shell.rm('-r', tempPath);
  }

  static async deleteInstance(name) {
    shell.exec(`rm -r ${instancesPath}/${name}`, { silent: true });
  }

  setup() {
    Propreties.syncPropertiesLists('bedrock', this.path, this.saved);
    this.run();
    this.handleServerEvents();
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
      this.verifyPlayerConnected(data);
      this.verifyPlayerDisconnected(data);
    });
  }

  verifyPlayerConnected(output) {
    if (output.includes('Player connected')) {
      // Player Connected
      this.online += 1;
      const gamertag = (output.split('] Player connected: ')[1]).split(',')[0];
    }
  }

  verifyPlayerDisconnected(output) {
    if (output.includes('Player disconnected')) {
      // Player Disconnected
      this.online -= 1;
      const gamertag = (output.split('] Player disconnected: ')[1]).split(',')[0];
    }
  }
}

export default Bedrock;
