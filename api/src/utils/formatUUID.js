function formatUUID(uuidString) {
  if (uuidString.length !== 32) return undefined;

  const formattedUUID = `${uuidString.slice(0, 8)}-${uuidString.slice(8, 12)}-${uuidString.slice(12, 16)}-${uuidString.slice(16, 20)}-${uuidString.slice(20)}`;
  return formattedUUID;
}

export default formatUUID;
