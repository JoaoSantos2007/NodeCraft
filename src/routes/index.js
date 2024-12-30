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
