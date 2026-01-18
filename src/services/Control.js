import fs from 'fs';
import { Rcon } from 'rcon-client';
import Path from 'path';
import Container from './Container.js';
import queryMinecraft from '../utils/queryMinecraft.js';
import config from '../../config/index.js';
import renderTemplate from '../utils/renderTemplate.js';
import REGISTRY from '../../config/registry.js';

class Control {
  constructor(instance) {
    this.id = instance.id;
    this.instance = instance;
    this.paths = {
      instance: Path.resolve(config.instance.path, instance.id),
      allowlist: Path.resolve(this.paths.instance, 'whitelist.json'),
      ops: Path.resolve(this.paths.instance, 'ops.json'),
      properties: Path.resolve(this.paths.instance, 'server.properties'),
      geyser: Path.resolve(this.paths.instance, 'plugins', 'Geyser-Spigot', 'config.yml'),
      floodgate: Path.resolve(this.paths.instance, 'plugins', 'floodgate', 'config.yml'),
      sessionLock: Path.resolve(this.paths.instance, 'world', 'session.lock'),
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

    if (!this.rcon) return;
    await this.rcon.send('whitelist reload');
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
    const properties = renderTemplate('server/server.properties', {
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
      const geyser = renderTemplate('server/geyser.yml', {
        motd: instance.name,
        name: instance.name,
        maxPlayers: instance.maxPlayers,
      });

      const floodgate = renderTemplate('server/floodgate.yml');

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
    links.forEach((link) => {
      const user = link.user || null;
      const access = link?.access;
      const gamertags = [];

      if (user) gamertags.push(...[user?.javaGamertag, user?.bedrockGamertag]);
      else gamertags.push(...[link.javaGamertag, link.bedrockGamertag]);

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
    });

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
      this.barrier.allowedGamertags.forEach(async (gamertag) => {
        await this.rcon.send(`whitelist add ${gamertag}`);
      });

      await this.rcon.send('whitelist reload');

      // Wipe privileges
      await this.wipeOps();

      // Set privileges
      this.barrier.opGamertags.forEach(async (gamertag) => {
        await this.rcon.send(`op ${gamertag}`);
      });
    }

    if (!this.barrier.updating) {
      const { players } = this.state;

      // Kick players without authorized gamertag
      players.forEach(async (player) => {
        if (!this.barrier.allowedGamertags.includes(player)) {
          await this.rcon.send(`kick ${player}`);
        }
      });
    }
  }

  async updateState() {
    const state = await queryMinecraft(this.instance.port);
    const { players } = state;
    const { barrier } = this;
    const { superGamertags } = barrier;

    // Verify barrier need update state
    const allowMonitored = superGamertags.some((gamertag) => players.includes(gamertag));
    if (allowMonitored !== barrier.allowMonitored) barrier.needUpdate = true;
    barrier.allowMonitored = allowMonitored;

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

      console.log('ok');
    } catch (err) {
      console.log(err);
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
    this.monitor.interval = setInterval(this.toMonitor(), 5000);

    // Set container listen
    Container.listen(this.id, (msg) => {
      this.updateHistory(msg);

      if (msg.includes('joined the game') || msg.includes('left the game')) {
        this.toMonitor();
      }
    });
  }

  static unmount(id) {
    if (REGISTRY[id]) {
      clearInterval(REGISTRY[id].monitor.interval);
      Container.removeStream(id);
      delete REGISTRY[id];
    }
  }
}

export default Control;
