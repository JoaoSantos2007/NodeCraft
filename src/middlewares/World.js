import multer from 'multer';
import shell from 'shelljs';
import crypto from 'crypto';
import { TEMPORARY_PATH } from '../utils/env.js';

const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Create Temp path
    const tempPath = `${TEMPORARY_PATH}/${crypto.randomUUID()}`;
    shell.mkdir(tempPath);
    req.upload = tempPath;

    cb(null, `${tempPath}`);
  },
  filename(req, file, cb) {
    if (file.originalname.endsWith('.mcworld') || file.originalname.endsWith('.zip')) {
      cb(null, 'upload.zip');
    } else {
      cb(new Error('The file uploaded must be .mcworld or .zip!'));
    }
  },
});

const worldUploader = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.endsWith('.mcworld') && !file.originalname.endsWith('.zip')) {
      cb(new Error('The file uploaded must be .mcworld or .zip!'));
    } else {
      cb(null, true);
    }
  },
});

export default worldUploader;
