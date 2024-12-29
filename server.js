import { existsSync, mkdirSync } from 'fs';
import app from './src/app.js';
import { PORT, ABSOLUTE_PATH } from './config/settings.js';

if (!existsSync(`${ABSOLUTE_PATH}/instances`)) mkdirSync(`${ABSOLUTE_PATH}/instances`);
if (!existsSync(`${ABSOLUTE_PATH}/temp`)) mkdirSync(`${ABSOLUTE_PATH}/temp`);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
