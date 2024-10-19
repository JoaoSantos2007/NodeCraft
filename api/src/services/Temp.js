import { randomUUID } from 'crypto';
import { mkdirSync, rmSync } from 'fs';
import { TEMPORARY_PATH } from '../utils/env.js';

class Temp {
  static create(autoDelete = false) {
    const id = randomUUID();
    const timestamp = new Date().getTime();
    const type = autoDelete ? 'auto' : 'manual';
    const tempPath = `${TEMPORARY_PATH}/${type}-${timestamp}-${id}`;

    mkdirSync(tempPath);
    return tempPath;
  }

  static delete(path) {
    rmSync(path, { recursive: true });
  }
}

export default Temp;
