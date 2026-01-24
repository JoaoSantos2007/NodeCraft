import fs, { rmSync } from 'fs';
import { Rcon } from 'rcon-client';
import Path from 'path';
import Container from '../services/Container.js';
import query from '../utils/query.js';
import config from '../../config/index.js';
import renderTemplate from '../utils/renderTemplate.js';
import instancesRunning from './instancesRunning.js';
import logger from '../../config/logger.js';

class Instance {
  constructor(instance, readFunction) {
    const instancePath = Path.join(config.instance.path, instance.id);

    this.id = instance.id;
    this.instance = instance;
    this.paths = {
      instance: instancePath,
      allowlist: Path.join(instancePath, 'whitelist.json'),
      ops: Path.join(instancePath, 'ops.json'),
      properties: Path.join(instancePath, 'server.properties'),
      geyser: Path.join(instancePath, 'plugins', 'Geyser-Spigot', 'config.yml'),
      floodgate: Path.join(instancePath, 'plugins', 'floodgate', 'config.yml'),
      sessionLock: Path.join(instancePath, 'world', 'session.lock'),
      usercache: Path.join(instancePath, 'usercache.json'),
    };
    this.state = {
      alive: false,
      onlinePlayers: 0,
      players: [],
      ping: null,
    };
    this.barrier = {
      allowedGamertags: [],
      superGamertags: [],
      opGamertags: [],
      allowMonitored: false,
      needUpdate: true,
      applyRules: true,
      updating: false,
    };
    this.monitor = {
      lastRun: 0,
      interval: null,
    };
    this.stream = null;
    this.rcon = null;
    this.tryingRconConnection = false;
    this.buffer = '';
    this.readFunction = readFunction;

    this.setup();
  }

  async emitEvent(command) {
    let result = null;
    try {
      if (this.rcon) result = await this.rcon.send(command);
    } catch (err) {
      logger.error({ err }, `Error to emit ${command}`);
    }

    return result;
  }

  async wipeAllowlist() {
    try {
      fs.writeFileSync(this.paths.allowlist, '[]', 'utf8');
      rmSync(this.paths.usercache, { recursive: true, force: true });

      await this.emitEvent('whitelist reload');
    } catch (err) {
      logger.error({ err }, 'Error to wipe instance allowlist');
    }
  }

  async wipeOps() {
    try {
      if (!this.rcon) {
        fs.writeFileSync(this.paths.ops, '[]', 'utf8');
      } else {
        const opsRaw = await this.emitEvent('op list');

        const currentOps = opsRaw
          .split(':')[1]
          ?.split(',')
          .map((p) => p.trim())
          .filter(Boolean) || [];

        for (const player of currentOps) {
          await this.emitEvent(`deop ${player}`);
        }
      }
    } catch (err) {
      logger.error({ err }, 'Error to wipe instance ops');
    }
  }

  async sync() {
    const instance = this.instance.get({ plain: true });

    try {
      // Sync database with server.properties
      const properties = renderTemplate('minecraft/server.properties', {
        name: instance.name,
        seed: instance.seed,
        gamemode: instance.gamemode,
        commandBlock: instance.commandBlock,
        secureProfile: instance.secureProfile,
        motd: instance.motd,
        pvp: instance.pvp,
        difficulty: instance.difficulty,
        maxPlayers: instance.maxPlayers,
        licensed: instance.licensed,
        viewDistance: instance.viewDistance,
        nether: instance.nether,
        idle: instance.idle,
        forceGamemode: instance.forceGamemode,
        hardcore: instance.hardcore,
        whitelist: instance.allowlist,
        enforceWhitelist: instance.allowlist,
        npcs: instance.npcs,
        animals: instance.animals,
        levelType: instance.levelType,
        monsters: instance.monsters,
        spawn: instance.spawn,
      });

      fs.writeFileSync(this.paths.properties, properties, 'utf8');
    } catch (err) {
      logger.error({ err }, 'Error to sync server.properties');
    }

    try {
      // Ensure bedrock
      if (instance.bedrock) {
        const geyser = renderTemplate('minecraft/geyser.yml', {
          motd: instance.name,
          name: instance.name,
          maxPlayers: instance.maxPlayers,
        });

        const floodgate = renderTemplate('minecraft/floodgate.yml');

        fs.writeFileSync(this.paths.geyser, geyser, 'utf8');
        fs.writeFileSync(this.paths.floodgate, floodgate, 'utf8');
      }
    } catch (err) {
      logger.error({ err }, 'Error to sync geyser and floodgate');
    }
  }

  async removeSessionLock() {
    try {
      fs.rmSync(this.paths.sessionLock, { recursive: true, force: true });
    } catch (err) {
      logger.error({ err }, 'Error to remove instance session lock');
    }
  }

  async verifyRcon() {
    try {
      if (!!this.rcon && !this.tryingRconConnection) return;

      this.tryingRconConnection = true;

      const containerIpAddress = await Container.getIpAddress(this.id);
      const rcon = await Rcon.connect({
        host: containerIpAddress,
        port: 25575,
        password: 'nodecraft',
      });

      this.rcon = rcon;
      this.tryingRconConnection = false;
      await this.runInitialCommands();
    } catch (err) {
      this.rcon = null;
      this.tryingRconConnection = false;
    }
  }

  async runInitialCommands() {
    try {
      if (!this.rcon) return;
      await this.emitEvent('gamerule send_command_feedback false');
      await this.emitEvent('gamerule  log_admin_commands false');
      await this.emitEvent('save-all');
      await this.emitEvent('save-on');
    } catch (err) {
      logger.error({ err }, 'Error to run first instance commands');
    }
  }

  async updateBarrier() {
    try {
      const instancePlain = this.instance.get({ plain: true });

      // Avoid players kicking while updating
      this.barrier.updating = true;

      // Wipe barrier gamertags
      this.barrier.allowedGamertags = [];
      this.barrier.superGamertags = [];

      const links = instancePlain.players || [];
      for (const link of links) {
        const access = link?.access;
        const gamertags = link.gamertags || [];

        if (access === 'super') {
          this.barrier.allowedGamertags.push(...gamertags);
          this.barrier.superGamertags.push(...gamertags);
        } else if (access === 'always') {
          this.barrier.allowedGamertags.push(...gamertags);
        } else if (access === 'monitored') {
          if (this.barrier.allowMonitored) this.barrier.allowedGamertags.push(...gamertags);
        }

        if (link.privileges) {
          this.barrier.opGamertags.push(...gamertags);
        }
      }

      this.barrier.needUpdate = false;
      this.barrier.updating = false;
      this.barrier.applyRules = true;
    } catch (err) {
      logger.error({ err }, 'Error to update instance barrier');
    }
  }

  async applyBarrier() {
    try {
      if (!this.rcon) return;

      if (this.barrier.applyRules) {
      // Wipe allowlist
        await this.wipeAllowlist();

        // Set allowlist
        for (const gamertag of this.barrier.allowedGamertags) {
          await this.emitEvent(`whitelist add ${gamertag}`);
        }

        // Reload whitelist
        await this.emitEvent('whitelist reload');

        // Wipe privileges
        await this.wipeOps();

        // Set privileges
        for (const gamertag of this.barrier.opGamertags) {
          await this.emitEvent(`op ${gamertag}`);
        }

        this.barrier.applyRules = false;
      }

      if (!this.barrier.updating && this.instance.allowlist) {
      // Kick players without authorized gamertag
        for (const player of this.state.players) {
          if (!this.barrier.allowedGamertags.includes(player.name)) {
            await this.emitEvent(`kick ${player.name}`);
          }
        }
      }
    } catch (err) {
      logger.error({ err }, 'Error to apply instance barrier');
    }
  }

  async updateState() {
    try {
      const state = await query(this.instance.port);
      const { barrier } = this;
      const { superGamertags } = barrier;

      // Verify allow monitored and barrier need update
      let allowMonitored = false;
      for (const player of state.players) {
        if (superGamertags.includes(player.name)) {
          allowMonitored = true;
          break;
        }
      }

      if (allowMonitored !== barrier.allowMonitored) {
        barrier.needUpdate = true;
        barrier.allowMonitored = allowMonitored;
      }

      this.state = {
        alive: state.online,
        onlinePlayers: state.onlinePlayers,
        players: state.players,
        ping: state.ping,
      };
    } catch (err) {
      logger.error({ err }, 'Error to update instance state');
    }
  }

  async newBarrier() {
    try {
      const instance = await this.readFunction();
      this.instance = instance;
      this.barrier.needUpdate = true;
    } catch (err) {
      logger.error({ err }, 'Error to set new instance barrier');
    }
  }

  async toMonitor() {
    try {
      // Verify last run
      if (this.monitor.lastRun + 500 >= Date.now()) return;

      await this.verifyRcon();
      await this.updateState();
      if (this.barrier.needUpdate) await this.updateBarrier();
      await this.applyBarrier();

      this.monitor.lastRun = Date.now();
    } catch (err) {
      logger.error({ err }, 'Error in instance monitoring!');
    }
  }

  async updateHistory(message) {
    try {
      // Get instance in registry
      const { instance } = this;

      // Copy instance history array
      let history = [...instance.history];
      history.push(message);

      // Wipe old lines
      const historyLength = history.length;
      const maxHistoryLength = config.instance.maxHistory || 0;
      if (historyLength > maxHistoryLength) {
        history = history.slice(historyLength - maxHistoryLength);
      }

      await instance.update({ history });
    } catch (err) {
      logger.error({ err }, 'Error to update instance history');
    }
  }

  async setup() {
    try {
      // Wipe allowlist and privilegies
      await this.wipeAllowlist();
      await this.wipeOps();

      // Sync properties files
      await this.sync();

      // Remove session.lock
      this.removeSessionLock();

      // Set monitoring
      this.monitor.interval = setInterval(() => this.toMonitor(), 5000);

      // Set container listen
      Container.listen(this.id, (msg) => {
        this.updateHistory(msg);

        if (msg.includes('joined the game') || msg.includes('left the game')) {
          this.toMonitor();
        }
      });
    } catch (err) {
      logger.error({ err }, 'Error to setup instance');
    }
  }

  stop() {
    try {
      clearInterval(this.monitor.interval);
      Container.removeStream(this.id);
      delete instancesRunning[this.id];
      delete this;
    } catch (err) {
      logger.error({ err }, 'Error to stop instance');
    }
  }
}

export default Instance;
