import express from 'express';
import cookieParser from 'cookie-parser';
import user from './user.js';
import auth from './auth.js';
import instance from './instance.js';
import group from './group.js';

const routes = (app) => {
  app.get('/', (req, res) => {
    res.status(200).send('Welcome to NodeCraft API!');
  });

  app.use(
    express.json(),
    cookieParser(),
    user,
    auth,
    instance,
    group,
  );
};

export default routes;
