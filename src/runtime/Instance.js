import fs, { rmSync } from 'fs';
import { Rcon } from 'rcon-client';
import Path from 'path';
import Container from '../services/Container.js';
import query from '../utils/query.js';
import config from '../../config/index.js';
import renderTemplate from '../utils/renderTemplate.js';
import instancesRunning from './instancesRunning.js';

class Instance {
  constructor(instance) {
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

    this.setup();
  }

  async wipeAllowlist() {
    fs.writeFileSync(this.paths.allowlist, '[]', 'utf8');
    rmSync(this.paths.usercache, { recursive: true, force: true });

    if (this.rcon) await this.rcon.send('whitelist reload');
  }

  async wipeOps() {
    if (!this.rcon) {
      fs.writeFileSync(this.paths.ops, '[]', 'utf8');
    } else {
      const opsRaw = await this.rcon.send('op list');

      const currentOps = opsRaw
        .split(':')[1]
        ?.split(',')
        .map((p) => p.trim())
        .filter(Boolean) || [];

      // eslint-disable-next-line no-restricted-syntax
      for (const player of currentOps) {
        // eslint-disable-next-line no-await-in-loop
        await this.rcon.send(`deop ${player}`);
      }
    }
  }

  async sync() {
    const instance = this.instance.get({ plain: true });

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
  }

  async removeSessionLock() {
    fs.rmSync(this.paths.sessionLock, { recursive: true, force: true });
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
    } catch {
      this.rcon = null;
      this.tryingRconConnection = false;
    }
  }

  async updateBarrier() {
    const instancePlain = this.instance.get({ plain: true });

    // Avoid players kicking while updating
    this.barrier.updating = true;

    // Wipe barrier gamertags
    this.barrier.allowedGamertags = [];
    this.barrier.superGamertags = [];

    const links = instancePlain.players || [];
    for (const link of links) {
      const user = link.user || null;
      const access = link?.access;
      const gamertags = [];

      if (user) {
        if (user?.javaGamertag) gamertags.push(user.javaGamertag);
        if (user?.javaGamertag) gamertags.push(user.bedrockGamertag);
      } else {
        if (link.javaGamertag) gamertags.push(link.javaGamertag);
        if (link.bedrockGamertag) gamertags.push(link.bedrockGamertag);
      }

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
  }

  async applyBarrier() {
    if (!this.rcon) return;

    if (this.barrier.applyRules) {
      // Wipe allowlist
      await this.wipeAllowlist();

      // Set allowlist
      for (const gamertag of this.barrier.allowedGamertags) {
        await this.rcon.send(`whitelist add ${gamertag}`);
      }

      // Reload whitelist
      await this.rcon.send('whitelist reload');

      // Wipe privileges
      await this.wipeOps();

      // Set privileges
      for (const gamertag of this.barrier.opGamertags) {
        await this.rcon.send(`op ${gamertag}`);
      }

      this.barrier.applyRules = false;
    }

    if (!this.barrier.updating) {
      // Kick players without authorized gamertag
      for (const player of this.state.players) {
        if (!this.barrier.allowedGamertags.includes(player.name)) {
          await this.rcon.send(`kick ${player.name}`);
        }
      }
    }
  }

  async updateState() {
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
  }

  async toMonitor() {
    // Verify last run

    try {
      await this.verifyRcon();
      await this.updateState();
      if (this.barrier.needUpdate) await this.updateBarrier();
      await this.applyBarrier();
    } catch (err) {
      // Save err in logs
    }
  }

  async updateHistory(message) {
    // Get instance in registry
    const { instance } = this;

    // Copy instance history array
    let history = [...instance.history];
    history.push(message);

    // Wipe old lines
    const historyLength = history.length;
    const maxHistoryLength = instance.maxHistory || 0;
    if (historyLength > maxHistoryLength) {
      history = history.slice(historyLength - maxHistoryLength);
    }

    await instance.update({ history });

    console.log(message);
  }

  async setup() {
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
  }

  static unmount(id) {
    if (instancesRunning[id]) {
      clearInterval(instancesRunning[id].monitor.interval);
      Container.removeStream(id);
      delete instancesRunning[id];
    }
  }
}

export default Instance;
