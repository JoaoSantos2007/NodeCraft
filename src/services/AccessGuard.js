/* eslint-disable no-param-reassign */
import { writeFileSync } from 'fs';

class AccessGuard {
  static wipe(instance) {
    if (instance.type === 'bedrock') {
      writeFileSync(`${instance.path}/permissions.json`, '[]', 'utf8');
      writeFileSync(`${instance.path}/allowlist.json`, '[]', 'utf8');
    } else if (instance.type === 'java') {
      writeFileSync(`${instance.path}/ops.json`, '[]', 'utf8');
      writeFileSync(`${instance.path}/whitelist.json`, '[]', 'utf8');
    }
  }

  static analyzer(output, instance) {
    AccessGuard.verifyPlayerConnected(output, instance);
    AccessGuard.verifyPlayerDisconnected(output, instance);
    AccessGuard.verifyServerStarted(output, instance);
    AccessGuard.verifyPlayerSpawned(output, instance);
  }

  static updateAccess(instance) {
    const playersData = instance.doc.get({ plain: true }).players;

    playersData.forEach((player) => {
      if (instance.type === 'bedrock') {
        if (player.access === 'always' || player.operator || (player.access === 'monitored' && instance.admins > 0)) {
          instance.emitEvent(`allowlist add ${player.gamertag}`);
        }

        if (player.access === 'monitored' && instance.admins < 0 && instance.players.includes(player.gamertag)) {
          instance.emitEvent(`kick ${player.gamertag}`);
        }
      } else if (instance.type === 'java') {
        if (player.access === 'always' || player.operator || (player.access === 'monitored' && instance.admins > 0)) {
          instance.emitEvent(`whitelist add ${player.gamertag}`);
        }

        if (player.access === 'monitored' && instance.admins < 0 && instance.players.includes(player.gamertag)) {
          instance.emitEvent(`kick ${player.gamertag}`);
        }
      }
    });
  }

  static grantPrivileges(instance, gamertag = null) {
    if (instance.type === 'bedrock') {
      instance.emitEvent(`op ${gamertag}`);
    } else if (instance.type === 'java') {
      const playersData = instance.doc.get({ plain: true }).players;

      playersData.forEach((player) => {
        if (player.operator === true) instance.emitEvent(`op ${player.gamertag}`);
      });
    }
  }

  static verifyPlayerConnected(output, instance) {
    if (instance.type === 'bedrock') {
      if (output.includes('Player connected')) {
        const gamertag = (output.split('] Player connected: ')[1]).split(',')[0];
        instance.online += 1;
        instance.players.push(gamertag);

        if (AccessGuard.verifyPlayerIsAdmin(instance, gamertag)) {
          instance.admins += 1;
          AccessGuard.updateAccess(instance);
        }
      }
    } else if (instance.type === 'java') {
      if (output.includes('joined the game')) {
        const gamertag = output.split(' joined the game')[0].split(' ').slice(-1)[0];
        instance.online += 1;
        instance.players.push(gamertag);

        if (AccessGuard.verifyPlayerIsAdmin(instance, gamertag)) {
          instance.admins += 1;
          AccessGuard.updateAccess(instance);
        }
      }
    }
  }

  static verifyPlayerDisconnected(output, instance) {
    if (instance.type === 'bedrock') {
      if (output.includes('Player disconnected')) {
        const gamertag = (output.split('] Player disconnected: ')[1]).split(',')[0];
        instance.online -= 1;
        instance.players.splice(instance.players.indexOf(gamertag), 1);

        if (AccessGuard.verifyPlayerIsAdmin(instance, gamertag)) {
          instance.admins -= 1;
          AccessGuard.updateAccess(instance);
        }
      }
    } else if (instance.type === 'java') {
      if (output.includes('left the game')) {
        const gamertag = output.split(' left the game')[0].split(' ').slice(-1)[0];
        instance.online -= 1;
        instance.players.splice(instance.players.indexOf(gamertag), 1);

        if (AccessGuard.verifyPlayerIsAdmin(instance, gamertag)) {
          instance.admins -= 1;
          AccessGuard.updateAccess(instance);
        }
      }
    }
  }

  static verifyPlayerSpawned(output, instance) {
    if (instance.type === 'bedrock') {
      if (output.includes('Player Spawned')) {
        const gamertag = (output.split('] Player Spawned: ')[1]).split(' xuid')[0];

        if (AccessGuard.verifyPlayerIsAdmin(instance, gamertag)) {
          AccessGuard.grantPrivileges(instance, gamertag);
        }
      }
    }
  }

  static verifyServerStarted(output, instance) {
    if (instance.type === 'bedrock') {
      if (output.includes('Server started') && instance.started === false) {
        instance.started = true;

        AccessGuard.updateAccess(instance);
      }
    } else if (instance.type === 'java') {
      if (output.includes('Done') && instance.started === false) {
        instance.started = true;

        AccessGuard.updateAccess(instance);
        AccessGuard.grantPrivileges(instance);
      }
    }
  }

  static verifyPlayerIsAdmin(instance, gamertag) {
    const playersData = instance.doc.get({ plain: true }).players;
    let isAdmin = false;

    playersData.forEach((player) => {
      if (player.gamertag === gamertag && player.operator === true) isAdmin = true;
    });

    return isAdmin;
  }
}

export default AccessGuard;
