const getVersion = async (software = 'vanilla') => {
  // Minecraft Vanilla
  if (software === 'vanilla') {
    const manifest = await (await fetch('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json')).json();
    const latestRelease = manifest.latest.release;
    const latestVersionInfo = manifest.versions.find((v) => v.id === latestRelease);

    const versionDetails = await (await fetch(latestVersionInfo.url)).json();
    const serverURL = versionDetails.downloads.server.url;
    return { version: latestRelease, build: 0, url: serverURL };
  }

  // Minecraft Paper
  if (software === 'paper') {
    const firstResponse = await (await fetch('https://api.papermc.io/v2/projects/paper')).json();
    const version = firstResponse.versions.pop();

    const secondResponse = await (await fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}/builds`)).json();
    const build = secondResponse.builds.pop()?.build;

    const url = `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build}/downloads/paper-${version}-${build}.jar`;

    return { version, build, url };
  }

  // Minecraft Purpur
  if (software === 'purpur') {
    const firstResponse = await (await fetch('https://api.purpurmc.org/v2/purpur')).json();
    const version = firstResponse.versions.pop();

    const secondResponse = await (await fetch(`https://api.purpurmc.org/v2/purpur/${version}`)).json();
    const build = secondResponse.builds.latest;

    const url = `https://api.purpurmc.org/v2/purpur/${version}/${build}/download`;

    return { version, build, url };
  }

  // Minecraft Geyser
  if (software === 'geyser') {
    const response = await (await fetch('https://download.geysermc.org/v2/projects/geyser/versions/latest/builds/latest')).json();

    const version = response?.version;
    const build = response?.build;
    const url = 'https://download.geysermc.org/v2/projects/geyser/versions/latest/builds/latest/downloads/spigot';

    return { version, build, url };
  }

  // Minecraft Floodgate
  if (software === 'floodgate') {
    const response = await (await fetch('https://download.geysermc.org/v2/projects/floodgate/versions/latest/builds/latest')).json();

    const version = response?.version;
    const build = response?.build;
    const url = 'https://download.geysermc.org/v2/projects/floodgate/versions/latest/builds/latest/downloads/spigot';

    return { version, build, url };
  }

  return { version: '', build: 0, url: '' };
};

const getInfo = async (instance) => {
  // Get Java latest info
  const instanceInfo = await getVersion(instance.software);
  let geyserInfo;
  let floodgateInfo;
  // Get Geyser and Floodgate latest info
  if (instance.bedrock === true) {
    geyserInfo = await getVersion('geyser');
    floodgateInfo = await getVersion('floodgate');
  }

  const info = {
    needInstanceUpdate: false,
    instanceVersion: instanceInfo?.version || '',
    instanceBuild: instanceInfo?.build || 0,
    instanceUrl: instanceInfo?.url || null,
    needGeyserUpdate: false,
    geyserVersion: geyserInfo?.version || '',
    geyserBuild: geyserInfo?.build || 0,
    geyserUrl: geyserInfo?.url || null,
    needFloodgateUpdate: false,
    floodgateVersion: floodgateInfo?.version || '',
    floodgateBuild: floodgateInfo?.build || 0,
    floodgateUrl: floodgateInfo?.url || null,
    neededUpdates: 0,
  };

  // Verify if instance needs updates
  info.needInstanceUpdate = instance.version !== info.instanceVersion;
  if (!info.needInstanceUpdate && info.instanceBuild) {
    info.needInstanceUpdate = Number(instance.build) !== Number(info.instanceBuild);
  }
  if (!instance.installed) info.needInstanceUpdate = true;
  // Verify if geyser and floodgate needs updates
  if (instance.bedrock) {
    info.needGeyserUpdate = Number(instance.geyserBuild) !== Number(info.geyserBuild);
    info.needFloodgateUpdate = Number(instance.floodgateBuild) !== Number(info.floodgateBuild);
  }

  // Count neededUpdates
  if (info.needInstanceUpdate) info.neededUpdates += 1;
  if (info.needGeyserUpdate) info.neededUpdates += 1;
  if (info.needFloodgateUpdate) info.neededUpdates += 1;

  return info;
};

export { getVersion, getInfo };
