import {
  mkdirSync,
  existsSync,
  readdirSync,
  rmSync,
} from 'fs';
import { TEMPORARY_MAX_AGE, TEMPORARY_PATH } from '../../config/settings.js';

const createTemp = () => {
  const timestamp = new Date().getTime();
  const tempPath = `${TEMPORARY_PATH}/${timestamp}`;

  mkdirSync(tempPath);
  return tempPath;
};

// Function to remove old temporary path
const removeOldTemp = () => {
  try {
    // Verify if temporary path exists
    if (!existsSync(TEMPORARY_PATH)) return;

    // Read temporary path items
    const items = readdirSync(TEMPORARY_PATH);

    // Get timestamp
    const now = Date.now();

    items.forEach((item) => {
      // Verify if item name is a timestamp
      const createdAt = Number(item);
      if (Number.isInteger(createdAt) && createdAt > 0) {
        if (now - createdAt >= TEMPORARY_MAX_AGE) rmSync(`${TEMPORARY_PATH}/${item}`, { recursive: true, force: true });
      } else {
        rmSync(`${TEMPORARY_PATH}/${item}`, { recursive: true, force: true });
      }
    });
  } catch (err) {
    console.error(err);
  }
};

export { createTemp, removeOldTemp };
