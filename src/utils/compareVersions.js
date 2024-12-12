function compareVersions(base, verify) {
  if (!/^\d+(\.\d+)+$/.test(verify)) return false;

  const partsOfBaseVersion = base.split('.');
  const partsOfVerifyVersion = verify.split('.');

  const partABaseVersion = Number(partsOfBaseVersion[0]);
  const partAVerifyVersion = Number(partsOfVerifyVersion[0]);
  if (partABaseVersion < partAVerifyVersion) return true;
  if (partABaseVersion > partAVerifyVersion) return false;

  const partBBaseVersion = Number(partsOfBaseVersion[1]);
  const partBVerifyVersion = Number(partsOfVerifyVersion[1]);
  if (partBBaseVersion < partBVerifyVersion) return true;
  if (partBBaseVersion > partBVerifyVersion) return false;

  return true;
}

export default compareVersions;
