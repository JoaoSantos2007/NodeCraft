import { writeFileSync } from 'fs';

const download = async (path, url) => {
  const response = await fetch(url);
  const blob = await response.blob();

  // Convert Blob in an Buffer before write file
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  writeFileSync(path, buffer);
};

export default download;
