import { NotFound, InvalidRequest, ServiceUnavailable } from '../errors/index.js';

const TIMEOUT = 10 * 1000;

// Mojang returns the UUID unhyphenated; the game files expect the canonical form.
const hyphenate = (id) => id.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');

const resolvers = {
  // Java: name → Mojang's UUID
  async java(input) {
    const url = `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(input)}`;

    let res;
    try {
      res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
    } catch {
      throw new ServiceUnavailable('Mojang API unavailable!');
    }

    if (res.status === 400) throw new InvalidRequest('Java player name is invalid!');
    if (res.status === 404 || res.status === 204) throw new NotFound('Java player not found!');
    if (!res.ok) throw new ServiceUnavailable('Mojang API unavailable!');

    let body;
    try {
      body = await res.json();
    } catch {
      throw new ServiceUnavailable('Mojang API unavailable!');
    }

    return { identifier: hyphenate(body.id), name: body.name };
  },

  // Bedrock: gamertag → XUID (GeyserMC Public API)
  async bedrock(input) {
    const url = `https://api.geysermc.org/v2/xbox/xuid/${encodeURIComponent(input)}`;

    let res;
    try {
      res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
    } catch {
      throw new ServiceUnavailable('GeyserMC API unavailable!');
    }

    if (res.status === 400) throw new InvalidRequest('Bedrock gamertag is invalid!');
    if (res.status === 404) throw new NotFound('Bedrock player not found!');
    if (!res.ok) throw new ServiceUnavailable('GeyserMC API unavailable!');

    let body;
    try {
      body = await res.json();
    } catch {
      throw new ServiceUnavailable('GeyserMC API unavailable!');
    }

    return { identifier: String(body.xuid), name: input };
  },
};

export default resolvers;
