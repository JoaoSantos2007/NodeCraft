const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;

const UNITS = [
  { ms: ONE_DAY, name: 'day' },
  { ms: ONE_HOUR, name: 'hour' },
  { ms: ONE_MINUTE, name: 'minute' },
  { ms: ONE_SECOND, name: 'second' },
];

const formatDuration = (ms) => {
  const unit = UNITS.find((candidate) => ms >= candidate.ms) ?? UNITS[UNITS.length - 1];
  const amount = Math.round(ms / unit.ms);

  return `${amount} ${unit.name}${amount === 1 ? '' : 's'}`;
};

export default formatDuration;
