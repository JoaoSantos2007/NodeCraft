import multer from 'multer';
import { INSTANCES_PATH } from '../utils/env.js';

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const { id } = req.params;
    let path = req?.params?.path ?? '';
    path += req.params[0] || '';
    const absolutePath = `${INSTANCES_PATH}/${id}/${path}`;
    const pathSplited = path.split('/');

    const filename = pathSplited[pathSplited.length - 1];
    const destiny = absolutePath.replace(filename, '');
    const location = path.replace(filename, '');

    req.filename = filename;
    req.destiny = destiny;
    req.location = location;
    cb(null, destiny);
  },
  filename(req, file, cb) {
    cb(null, req.filename);
  },
});

const uploader = multer({
  storage,
});

export default uploader;
