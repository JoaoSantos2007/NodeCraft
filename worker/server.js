import http from 'http';
import app from './src/app.js';
import config from './config/config.js';
import Maintenance from './src/services/Maintenance.js';
import Server from './src/services/Server.js';
import { initSocket } from './config/socket.js';
import setupWebsocket from './src/websocket/index.js';
import Heartbeat from './src/services/Heartbeat.js';
import logger from './config/logger.js';

const server = http.createServer(app);

const io = initSocket(server);
setupWebsocket(io);

server.listen(config.app.port, async () => {
  logger.info({ port: config.app.port }, 'NodeCraft Worker is running');

  await Heartbeat.define();
  await Maintenance.ensureEnviroment();
  await Server.wakeUp();
  await Maintenance.cleanUp();
});
