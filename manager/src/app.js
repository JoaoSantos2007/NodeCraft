import express from 'express';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import SwaggerParser from '@apidevtools/swagger-parser';
import routes from './routes/index.js';
import handleError from './middlewares/handleError.js';
import handleNotFound from './middlewares/handleNotFound.js';
import config from '../config/config.js';
import logger from '../config/logger.js';

const app = express();

if (config.app.isDev) {
  const swaggerDocument = await SwaggerParser.bundle(
    fileURLToPath(new URL('../swagger/openapi.json', import.meta.url)),
  );

  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument),
  );

  logger.info({ docs: `http://127.0.0.1:${config.app.port}/docs/` }, 'See the API docs!');
}

routes(app);
app.use(handleNotFound);
app.use(handleError);

export default app;
