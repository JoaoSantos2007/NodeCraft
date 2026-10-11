// Include directory metadata and allocated blocks. Charging at least one
// filesystem block per directory prevents unlimited empty-directory creation.
const DIRECTORY_BYTES = 4096;

const diskBytes = (stats) => {
  const allocated = (stats.blocks || 0) * 512;

  if (stats.isDirectory()) return Math.max(DIRECTORY_BYTES, allocated);
  if (stats.isFile()) return Math.max(DIRECTORY_BYTES, stats.size, allocated);

  return 0;
};

export { DIRECTORY_BYTES, diskBytes };
