import {
  statSync, readdirSync, readFileSync, mkdirSync, writeFileSync, existsSync,
} from 'fs';
import { INSTANCES_PATH } from '../utils/env.js';
import validator from '../validators/file.js';
import { Base, InvalidRequest } from '../errors/index.js';

class File {
  static verifyType(path) {
    const stats = statSync(path);
    const isDir = stats.isDirectory(path);
    const isFile = stats.isFile(path);

    if (isDir) return 'dir';
    if (isFile) return 'file';
    throw new Base(`${path} is not file and not dir`);
  }

  static read(id, path = '') {
    const absolutePath = `${INSTANCES_PATH}/${id}/${path}`;
    const type = File.verifyType(absolutePath);

    if (type === 'file') return readFileSync(absolutePath, 'utf8');
    const files = [];
    const items = readdirSync(absolutePath);

    items.forEach((item) => {
      files.push({
        name: item,
        type: File.verifyType(`${absolutePath}/${item}`),
      });
    });

    return files;
  }

  static create(id, path, data) {
    validator(data);
    const { name, type } = data;
    const absolutePath = `${INSTANCES_PATH}/${id}/${path}/${name}`;
    if (existsSync(absolutePath)) throw new InvalidRequest(`${name} already exists`);

    if (type === 'dir') return mkdirSync(absolutePath);
    return writeFileSync(absolutePath, data.content, 'utf8');
  }
}

export default File;
