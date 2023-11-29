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
    if (file.originalname.endsWith('.mcworld')) {
      cb(null, 'upload.mcworld');
    } else {
      cb(new Error('The file uploaded must be .mcworld'));
    }
  },
});

const bedrockUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.endsWith('.mcworld')) {
      cb(new Error('The file uploaded must be .mcworld!'));
    } else {
      cb(null, true);
    }
  },
});

export { bedrockUpload };
