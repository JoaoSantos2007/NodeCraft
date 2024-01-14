import { existsSync, mkdirSync } from 'fs';
import app from './src/app.js';
import { PORT, ABSOLUTE_PATH } from './src/utils/env.js';

if (!existsSync(`${ABSOLUTE_PATH}/instances`)) mkdirSync(`${ABSOLUTE_PATH}/instances`);
if (!existsSync(`${ABSOLUTE_PATH}/temp`)) mkdirSync(`${ABSOLUTE_PATH}/temp`);

app.listen(PORT, () => {
  console.log(`Server is running in port ${PORT}`);
});
