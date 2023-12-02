import shell from 'shelljs';
import { INSTANCES_PATH } from '../utils/env.js';
import Propreties from '../utils/Properties.js';

class Java {
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
