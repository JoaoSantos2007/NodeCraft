import multer from 'multer';
import shell from 'shelljs';
import crypto from 'crypto';
import Instance from '../services/Instance.js';
import { TEMPORARY_PATH } from '../utils/env.js';
import { InvalidRequest } from '../errors/index.js';
import errorHandler from '../utils/errorHandler.js';

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

const worldValidator = async (req, res, next) => {
  try {
    const worldType = req.query?.world;
    if (!worldType) return next();
    if (worldType.toLowerCase() !== 'nether' && worldType.toLowerCase() !== 'end') throw new InvalidRequest('World query only allows nehter or end');

    const instance = await Instance.readOne(req.params.id);
    const { type, software } = instance;
    if (type === 'bedrock' && worldType) throw new InvalidRequest("Bedrock instances don't allow world query");
    if (type === 'java' && software === 'vanilla' && worldType) throw new InvalidRequest("Java instances with vanilla software dont't allow world query");

    return next();
  } catch (err) {
    return errorHandler(err, res);
  }
};

export { worldUploader, worldValidator };
