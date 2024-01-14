import express from 'express';
import routes from './routes/index.js';
import errorMiddleware from './middlewares/error.js';

const app = express();
routes(app);
app.use(errorMiddleware);

export default app;
