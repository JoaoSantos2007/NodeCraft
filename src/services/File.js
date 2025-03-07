import {
  statSync,
  readdirSync,
  readFileSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  openSync,
  readSync,
  closeSync,
  renameSync,
} from 'fs';
import Path from 'path';
import AdmZip from 'adm-zip';
import { randomUUID } from 'crypto';
import { INSTANCES_PATH } from '../../config/settings.js';
import Validator from '../validators/File.js';
import Temp from './Temp.js';
import { Base, InvalidRequest } from '../errors/index.js';

class File {
  static verifyType(path) {
    const stats = statSync(path);
    const isDir = stats.isDirectory(path);
    const isFile = stats.isFile(path);

    if (isDir) return 'dir';
    if (isFile) return 'file';
    throw new Base('Invalid file type!');
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
    Validator(data);
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
    Validator(data);
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

  static verifyZipFile(filePath) {
    const ZIP_SIGNATURE = [0x50, 0x4B]; // PK
    const buffer = Buffer.alloc(2);

    try {
      const fd = openSync(filePath, 'r');
      readSync(fd, buffer, 0, 2, 0);
      closeSync(fd);
      return buffer[0] === ZIP_SIGNATURE[0] && buffer[1] === ZIP_SIGNATURE[1];
    } catch (err) {
      throw new Base('Error verifying zip file!');
    }
  }

  static unzip(id, path) {
    const absolutePath = `${INSTANCES_PATH}/${id}/${path}`;
    const type = File.verifyType(absolutePath);

    // Validate
    if (type !== 'file') throw new InvalidRequest("You can't unzip a folder!");
    if (!File.verifyZipFile(absolutePath)) throw new InvalidRequest('Invalid zip file!');

    // Unzip
    const parentDir = Path.dirname(absolutePath);
    const extractPathName = randomUUID();
    const extractTo = `${parentDir}/${extractPathName}`;
    mkdirSync(extractTo);

    const zip = new AdmZip(absolutePath);
    zip.extractAllTo(extractTo, true);

    return extractPathName;
  }

  static move(id, path, destiny) {
    const absolutePath = `${INSTANCES_PATH}/${id}/${path}`;
    const absoluteDestiny = `${INSTANCES_PATH}/${id}/${destiny}`;

    renameSync(absolutePath, absoluteDestiny);

    return true;
  }
}

export default File;
