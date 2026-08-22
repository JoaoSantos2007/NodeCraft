import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import config from '../../config/config.js';
import user from './user.js';
import instance from './instance.js';
import worker from './worker.js';
import auth from './auth.js';
import root from './root.js';

const routes = (app) => {
  app.use((req, res, next) => {
    const origin = req?.headers?.origin;
    if (origin && config.app.corsOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    return next();
  });

  app.use(
    express.json(),
    cookieParser(),
    helmet(),
    root,
    user,
    instance,
    auth,
    worker,
  );
};

export default routes;
