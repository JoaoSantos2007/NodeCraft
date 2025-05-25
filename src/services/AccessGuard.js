import { writeFileSync } from 'fs';

class AccessGuard {
  static wipePrivileges(path) {
    writeFileSync(`${path}/permissions.json`, '[]', 'utf8');
  }

  static async control(output, instance) {
    this.verifyPlayerConnected(output, instance);
    this.verifyPlayerSpawned(output, instance);
    this.verifyPlayerDisconnected(output, instance);
    this.verifyServerIsDone(output, instance);
  }

  static updateAccess() {
    const playersValues = this.readPlayers();
    const allowlist = [];
    playersValues.forEach((player) => {
      if (player.access === 'always' || player.operator === true) allowlist.push({ ignoresPlayerLimit: player.operator, name: player.gamertag });
      if (player.access === 'monitored' && this.admins > 0) allowlist.push({ ignoresPlayerLimit: false, name: player.gamertag });
      if (player.access === 'monitored' && this.admins <= 0 && this.players.includes(player.gamertag)) this.emitEvent(`kick ${player.gamertag}`);
    });

    writeFileSync(`${this.path}/allowlist.json`, JSON.stringify(allowlist), 'utf8');
  }


  static verifyPlayerConnected(output) {
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

  static verifyPlayerSpawned(output) {
    if (output.includes('Player Spawned')) {
      const gamertag = (output.split('] Player Spawned: ')[1]).split(' xuid')[0];

      this.verifyPrivileges(gamertag);
    }
  }

  static verifyPlayerDisconnected(output) {
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

  static verifyPrivileges(gamertag) {
    this.readPlayers().forEach((player) => {
      if (player.gamertag === gamertag && player.operator) {
        this.emitEvent(`op ${gamertag}`);
      }
    });
  }
}

export default AccessGuard;
