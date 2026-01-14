import {
  mkdirSync,
  existsSync,
  readdirSync,
  rmSync,
} from 'fs';
import config from '../../config/index.js';

const createTemp = () => {
  const timestamp = new Date().getTime();
  const tempPath = `${config.temp.path}/${timestamp}`;

  mkdirSync(tempPath);
  return tempPath;
};

// Function to remove old temporary path
const removeOldTemp = () => {
  try {
    // Verify if temporary path exists
    if (!existsSync(config.temp.path)) return;

    // Read temporary path items
    const items = readdirSync(config.temp.path);

    // Get timestamp
    const now = Date.now();

    items.forEach((item) => {
      // Verify if item name is a timestamp
      const createdAt = Number(item);
      if (Number.isInteger(createdAt) && createdAt > 0) {
        if (now - createdAt >= config.temp.lifetime) rmSync(`${config.temp.path}/${item}`, { recursive: true, force: true });
      } else {
        rmSync(`${config.temp.path}/${item}`, { recursive: true, force: true });
      }
    });
  } catch (err) {
    // Catch error
  }
};

export { createTemp, removeOldTemp };
