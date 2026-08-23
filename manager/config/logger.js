import pino from 'pino';
import config from './config.js';

const logger = pino({
  level: config.log.level,
  base: { service: 'manager' },
  redact: {
    paths: [
      'body.password',
      'body.token',
      'req.body.password',
      'req.body.token',
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    censor: '[redacted]',
  },
  ...(config.app.isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'service',
      },
    },
  }),
});

export default logger;
