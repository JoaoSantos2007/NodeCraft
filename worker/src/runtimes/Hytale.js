import Path from 'path';
import { readFile, writeFile } from 'node:fs/promises';
import { finished } from 'node:stream/promises';
import Instance from './Instance.js';
import logger from '../../config/logger.js';
import Container from '../services/Container.js';
import { verifyNoSymlinks } from '../utils/verifyPaths.js';

class Hytale extends Instance {
  constructor(instance) {
    super(instance);

    this.paths = {
      settings: Path.join(this.path, 'config.json'),
    };
  }

  async syncSettings() {
    const gameData = this.instance?.hytale;
    if (!gameData) throw new Error('instance hytale data not found!');

    await verifyNoSymlinks(this.paths.settings, true);

    let settings = {};
    try {
      settings = JSON.parse(await readFile(this.paths.settings, 'utf8'));
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }

    if (!settings || typeof settings !== 'object' || Array.isArray(settings)
      || (settings.Defaults !== undefined && (!settings.Defaults
        || typeof settings.Defaults !== 'object' || Array.isArray(settings.Defaults)))) {
      throw new Error('Invalid Hytale config.json');
    }

    // Preserve generated settings and plugin options; only the panel's fields are managed here.
    Object.assign(settings, {
      ServerName: gameData.servername,
      MOTD: gameData.motd,
      Password: gameData.password,
      MaxPlayers: this.instance.maxPlayers,
      MaxViewRadius: gameData.maxView,
      Defaults: {
        ...settings.Defaults,
        World: gameData.worldname,
        GameMode: gameData.gamemode === 'creative' ? 'Creative' : 'Adventure',
      },
    });

    await writeFile(this.paths.settings, `${JSON.stringify(settings, null, 2)}\n`, 'utf8');
  }

  async sendCommand(command) {
    try {
      const container = await Container.get(this.id, true);
      if (!container) throw new Error('Hytale container not found');

      const execution = await container.exec({
        User: 'hytale',
        Cmd: ['timeout', '5s', '/home/hytale/server/command.sh', command],
        AttachStdout: true,
        AttachStderr: true,
      });

      const stream = await execution.start({});
      const completion = finished(stream);
      stream.resume();

      await completion;
      const result = await execution.inspect();
      if (result.ExitCode !== 0) throw new Error('Hytale command could not be delivered');
    } catch (err) {
      logger.error({ err }, 'Error to send Hytale command');

      if (this.io) {
        this.io.to(`instance:${this.id}`).emit('instance-output', 'Could not send command to Hytale. The server may still be starting.');
      }
    }
  }

  async setup() {
    try {
      const container = await Container.get(this.id, true);
      const details = await container?.inspect();

      // Worker recovery must not rewrite the configuration of a live server.
      if (!details?.State.Running) await this.syncSettings();

      await this.start();

      // Include startup output: the downloader can print its OAuth URL before attachment.
      await this.listenStreamEvents(undefined, { logs: true });
      if (!this.stream) throw new Error('Could not attach to Hytale console');
    } catch (err) {
      logger.error({ err }, 'Error to setup hytale instance');
      throw err;
    }
  }
}

export default Hytale;
