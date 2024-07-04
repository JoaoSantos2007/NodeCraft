import {
  statSync, readdirSync, readFileSync, mkdirSync, writeFileSync, rmSync,
} from 'fs';
import Path from 'path';
import AdmZip from 'adm-zip';
import { randomUUID } from 'crypto';
import { INSTANCES_PATH } from '../utils/env.js';
import validator from '../validators/file.js';
import Temp from './Temp.js';

class File {
  static verifyType(path) {
    const stats = statSync(path);
    const isDir = stats.isDirectory(path);
    const isFile = stats.isFile(path);

    if (isDir) return 'dir';
    if (isFile) return 'file';
    throw new Error();
  }

  static read(id, path = '', info = '') {
    const absolutePath = `${INSTANCES_PATH}/${id}/${path}`;
    const type = info || File.verifyType(absolutePath);
    let content;

    if (type === 'file') content = readFileSync(absolutePath, 'utf8');
    else {
      const items = readdirSync(absolutePath);
      content = [];
      items.forEach((item) => {
        content.push({
          name: item,
          type: File.verifyType(`${absolutePath}/${item}`),
        });
      });
    }

    return {
      type,
      content,
    };
  }

  static create(id, path, data) {
    validator(data);
    const { type } = data;
    const absolutePath = `${INSTANCES_PATH}/${id}/${path}`;
    let content = '';

    if (type === 'dir') {
      mkdirSync(absolutePath);
      content = [];
    } else {
      writeFileSync(absolutePath, data.content, 'utf8');
      content = data.content;
    }

    return {
      type,
      content,
    };
  }

  static update(id, path, data) {
    validator(data);
    const absolutePath = `${INSTANCES_PATH}/${id}/${path}`;
    const type = File.verifyType(absolutePath);
    if (type === 'file') writeFileSync(absolutePath, data.content, 'utf8');

    return File.read(id, path, type);
  }

  static delete(id, path) {
    const info = File.read(id, path);
    rmSync(`${INSTANCES_PATH}/${id}/${path}`, { recursive: true });

    return info;
  }

  static addFolderToZip(zip, folderPath, folderInZipPath) {
    const items = readdirSync(folderPath);
    items.forEach((item) => {
      const fullPath = Path.join(folderPath, item);
      const pathInZip = Path.join(folderInZipPath, item);
      if (statSync(fullPath).isDirectory()) {
        File.addFolderToZip(zip, fullPath, pathInZip);
      } else {
        zip.addLocalFile(fullPath, folderInZipPath);
      }
    });
  }

  static zip(pathFrom, pathTo) {
    const zip = new AdmZip();
    File.addFolderToZip(zip, pathFrom, '');
    zip.writeZip(pathTo);
  }

  static download(id, path) {
    const absolutePath = `${INSTANCES_PATH}/${id}/${path}`;
    const type = File.verifyType(absolutePath);

    // File
    if (type === 'file') return absolutePath;

    // Path
    const tempPath = Temp.create(true);
    const pathTo = `${tempPath}/${randomUUID()}.zip`;
    File.zip(absolutePath, pathTo);
    return pathTo;
  }
}

export default File;
