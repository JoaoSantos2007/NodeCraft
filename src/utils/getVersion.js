const getVersion = async (software = 'vanilla') => {
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

  // Minecraft Vanilla
  if (software === 'vanilla') {
    const manifest = await (await fetch('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json')).json();
    const latestRelease = manifest.latest.release;
    const latestVersionInfo = manifest.versions.find((v) => v.id === latestRelease);

    const versionDetails = await (await fetch(latestVersionInfo.url)).json();
    const serverURL = versionDetails.downloads.server.url;
    return { version: latestRelease, build: 0, url: serverURL };
  }

  // Minecraft Bedrock
  if (software === 'bedrock') {
    let version = '';
    let url = '';

    const response = await (await fetch('https://net-secondary.web.minecraft-services.net/api/v1.0/download/links')).json();
    response.result.links.forEach((link) => {
      if (link.downloadType === 'serverBedrockLinux') {
        url = link.downloadUrl;

        // eslint-disable-next-line prefer-destructuring
        version = url.split('bedrock-server-')[1].split('.zip')[0];
      }
    });

    return { version, build: 0, url };
  }

  return { version: '', build: 0, url: '' };
};

export default getVersion;
