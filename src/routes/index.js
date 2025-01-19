import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import user from './user.js';
import auth from './auth.js';
import instance from './instance.js';
import group from './group.js';
import settings from './settings.js';

const routes = (app) => {
  app.get('/', (req, res) => {
    res.status(200).send('Welcome to NodeCraft API!');
  });

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3001'); // Allowed domains
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Credentials', 'true'); // Allow cookies send

    // Answer OPTIONS requests (preflight)
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    return next();
  });

  app.use(
    express.json(),
    cookieParser(),
    helmet(),
    user,
    auth,
    instance,
    group,
    settings,
  );
};

export default routes;
