import shell from 'shelljs';
import { INSTANCES_PATH } from '../utils/env.js';
import Propreties from '../services/Properties.js';

class Bedrock {
  constructor(settings) {
    this.settings = settings;
    this.path = `${INSTANCES_PATH}/${settings.id}`;
    this.online = 0;
    this.admins = [];
    this.players = [];
    this.setup();
  }

  setup() {
    Propreties.syncPropertiesLists(this.path, this.settings);
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
