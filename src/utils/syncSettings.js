import { existsSync, mkdirSync, writeFileSync } from 'fs';

const syncProperties = (instance, path) => {
  let settings;

  if (instance.type === 'bedrock') {
    settings = `
server-name=${instance.name}
gamemode=${instance.gamemode}
force-gamemode=${instance.forceGamemode}
difficulty=${instance.difficulty}
allow-cheats=${instance.cheats}
max-players=${instance.maxPlayers}
online-mode=${instance.licensed}
allow-list=${instance.allowlist}
server-port=25565
server-portv6=25565
enable-lan-visibility=false
view-distance=${instance.viewDistance}
tick-distance=4
player-idle-timeout=${instance.idle}
max-threads=8
level-name=world
level-seed=${instance.seed}
default-player-permission-level=member
texturepack-required=false
content-log-file-enabled=false
compression-threshold=1
compression-algorithm=zlib
server-authoritative-movement=server-auth
player-movement-score-threshold=20
player-movement-action-direction-threshold=0.85
player-movement-distance-threshold=0.3
player-movement-duration-threshold-in-ms=500
correct-player-movement=false
server-authoritative-block-breaking=false
chat-restriction=None
disable-player-interaction=false
client-side-chunk-generation-enabled=true
block-network-ids-are-hashes=true
disable-persona=false
disable-custom-skins=false
server-build-radius-ratio=Disabled
motd=${instance.motd}
    `;
  } else if (instance.type === 'java') {
    settings = `
server-name=${instance.name}
enable-jmx-monitoring=false
rcon.port=25575
level-seed=${instance.seed}
gamemode=${instance.gamemode}
enable-command-block=${instance.commandBlock}
enable-query=true
generator-settings={}
enforce-secure-profile=${instance.secureProfile}
level-name=world
motd=${instance.motd}
query.port=25565
pvp=${instance.pvp}
generate-structures=true
max-chained-neighbor-updates=1000000
difficulty=${instance.difficulty}
network-compression-threshold=256
max-tick-time=60000
require-resource-pack=false
use-native-transport=true
max-players=${instance.maxPlayers}
online-mode=${instance.licensed}
enable-status=true
allow-flight=false
initial-disabled-packs=
broadcast-rcon-to-ops=true
view-distance=${instance.viewDistance}
server-ip=
resource-pack-prompt=
allow-nether=${instance.nether}
server-port=25565
enable-rcon=true
sync-chunk-writes=true
op-permission-level=4
prevent-proxy-connections=false
hide-online-players=false
resource-pack=
entity-broadcast-range-percentage=100
simulation-distance=10
rcon.password=
player-idle-timeout=${instance.idle}
force-gamemode=${instance.forceGamemode}
rate-limit=0
hardcore=${instance.hardcore}
white-list=${instance.allowlist}
broadcast-console-to-ops=true
spawn-npcs=${instance.npcs}
spawn-animals=${instance.animals}
log-ips=true
function-permission-level=2
initial-enabled-packs=vanilla
level-type=${instance.levelType}
text-filtering-config=
spawn-monsters=${instance.monsters}
enforce-whitelist=${instance.allowlist}
spawn-protection=${instance.spawn}
resource-pack-sha1=
max-world-size=29999984  
    `;
  }

  writeFileSync(`${path}/server.properties`, settings, 'utf8');
};

const syncGeyser = (instance, path) => {
  if (!existsSync(`${path}/plugins`)) mkdirSync(`${path}/plugins`);
  if (!existsSync(`${path}/plugins/Geyser-Spigot`)) mkdirSync(`${path}/plugins/Geyser-Spigot`);

  const settings = `
bedrock:
  address: 0.0.0.0
  port: 19132
  clone-remote-port: true

java:
  auth-type: online

motd:
  primary-motd: Nodecraft
  secondary-motd: ${instance.name}
  passthrough-motd: true
  max-players: ${instance.maxPlayers}
  passthrough-player-counts: true
  integrated-ping-passthrough: true
  ping-passthrough-interval: 3

gameplay:
  server-name: ${instance.name}
  show-cooldown: title
  command-suggestions: true
  show-coordinates: true
  disable-bedrock-scaffolding: false
  nether-roof-workaround: true
  emotes-enabled: true
  unusable-space-block: minecraft:barrier
  enable-custom-content: true
  force-resource-packs: true
  enable-integrated-pack: true
  forward-player-ping: false
  xbox-achievements-enabled: true
  max-visible-custom-skulls: 128
  custom-skull-render-distance: 32

default-locale: system
log-player-ip-addresses: true

saved-user-logins:
  - ThisExampleUsernameShouldBeLongEnoughToNeverBeAnXboxUsername
  - ThisOtherExampleUsernameShouldAlsoBeLongEnough

pending-authentication-timeout: 120
notify-on-new-bedrock-update: true

advanced:
  cache-images: 0
  scoreboard-packet-threshold: 20
  add-team-suggestions: true
  resource-pack-urls: []
  floodgate-key-file: key.pem
  java:
    use-haproxy-protocol: false
    use-direct-connection: true
    disable-compression: true
  bedrock:
    broadcast-port: 0
    compression-level: 6
    use-haproxy-protocol: false
    mtu: 1400
    validate-bedrock-login: true
  
debug-mode: false

config-version: 5
`;

  writeFileSync(`${path}/plugins/Geyser-Spigot/config.yml`, settings, 'utf8');
};

const syncFloodgate = (instance, path) => {
  if (!existsSync(`${path}/plugins`)) mkdirSync(`${path}/plugins`);
  if (!existsSync(`${path}/plugins/floodgate`)) mkdirSync(`${path}/plugins/floodgate`);

  const settings = `
key-file-name: key.pem
username-prefix: "."
replace-spaces: true
disconnect:
  invalid-key: Please connect through the official Geyser
  invalid-arguments-length: Expected {} arguments, got {}. Is Geyser up-to-date?

player-link:
  enabled: true
  require-link: false
  enable-own-linking: false
  allowed: true
  link-code-timeout: 300
  type: sqlite
  enable-global-linking: true

metrics:
  enabled: true
  uuid: 6e4ad035-4b39-4520-89eb-cac107468ee6

config-version: 3
`;

  writeFileSync(`${path}/plugins/floodgate/config.yml`, settings, 'utf8');
};

export { syncProperties, syncGeyser, syncFloodgate };
