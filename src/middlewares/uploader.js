import multer from 'multer';
import Temp from '../services/Temp.js';

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const tempPath = Temp.create();
    req.upload = tempPath;

    cb(null, `${tempPath}`);
  },
  filename(req, file, cb) {
    cb(null, 'upload.zip');
  },
});

const uploader = multer({
  storage,
});

export default uploader;
