const getLatestMinecraftJavaVersion = async () => {
  const response = await fetch('https://launchermeta.mojang.com/mc/game/version_manifest.json');
  const data = await response.json();

  if (data && data.latest && data.versions) {
    const latestVersion = data.latest.release;

    // eslint-disable-next-line no-restricted-syntax
    for (const version of data.versions) {
      if (version.id === latestVersion && version.type === 'release') {
        return version.id;
      }
    }
  }

  return 0;
};

const getLatestMinecraftBedrockVersion = (url) => {
  // Encontra a parte da URL que contém a versão
  const partsOfUrl = url.split('/');
  const lastPart = partsOfUrl[partsOfUrl.length - 1];

  // Remove a extensão .zip
  const archiveName = lastPart.split('.zip')[0];

  // Separa a versão do restante do nome do arquivo
  const partsOfName = archiveName.split('-');
  const version = partsOfName[partsOfName.length - 1];

  return version;
};

const getLatestMinecraftVersion = async (type, url = null) => {
  let version = 0;

  if (type === 'bedrock') version = getLatestMinecraftBedrockVersion(url);
  else if (type === 'java') version = await getLatestMinecraftJavaVersion();

  return version;
};

export default getLatestMinecraftVersion;
