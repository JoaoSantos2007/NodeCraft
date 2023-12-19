import fs from 'fs';
import axios from 'axios';

const download = async (path, url) => {
  const response = await axios.get(url, { responseType: 'stream' });

  const writer = fs.createWriteStream(path);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

export default download;
