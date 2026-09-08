import pino from 'pino';
import config from './config.js';

const logger = pino({
  level: config.log.level,
  // manager and worker both land in journald; this tells them apart.
  base: { service: 'worker' },
  // Safety net for call sites that log a request-shaped object. The real fix
  // is not passing secrets to the logger (see middlewares/handleError.js),
  // but redact censors at serialization time, so anything logged under these
  // paths later is covered without revisiting every call site.
  //   - authorization: carries MANAGER_SECRET (middlewares/manager.js).
  //   - content: file body from the editor, e.g. a server.properties with
  //     rcon.password in it (controllers/File.js).
  redact: {
    paths: [
      'body.content',
      'req.body.content',
      'req.headers.authorization',
    ],
    censor: '[redacted]',
  },
  // Dev only: renders the JSON as a readable colored line in the terminal.
  // Production stays raw JSON on stdout, which is what journald stores and
  // what `jq` can query. pino-pretty is a devDependency, and deploy.sh runs
  // `npm ci --omit=dev`, so it is never installed in production.
  ...(config.app.stage === 'DEV' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        // Redundant in a dev terminal, where each process has its own window.
        ignore: 'service',
      },
    },
  }),
});

export default logger;
