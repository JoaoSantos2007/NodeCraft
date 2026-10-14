import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import config from '../../config/config.js';
import server from './server.js';

const routes = (app) => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allowed domains
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.header('Access-Control-Allow-Credentials', 'true'); // Allow cookies send

    // Answer OPTIONS requests (preflight)
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    return next();
  });

  app.use(
    express.json({ limit: config.http.jsonBytes }),
    cookieParser(),
    helmet(),
    server,
  );
};

export default routes;
