import { randomUUID } from 'crypto';
import { mkdirSync, rmSync } from 'fs';
import { TEMPORARY_PATH } from '../utils/env.js';

class Temp {
  static create() {
    const tempPath = `${TEMPORARY_PATH}/${randomUUID()}`;
    mkdirSync(tempPath);
    return tempPath;
  }

  static delete(path) {
    rmSync(path, { recursive: true });
  }
}

export default Temp;
