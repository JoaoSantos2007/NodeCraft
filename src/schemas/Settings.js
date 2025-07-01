const Settings = {
  instancesPath: {
    type: 'string',
  },
  temporaryPath: {
    type: 'string',
  },
  logPath: {
    type: 'string',
  },
  backupPath: {
    type: 'string',
  },
  accessTokenLifetime: {
    type: 'number',
    int: true,
    min: 1,
  },
  enableInterface: {
    type: 'boolean',
  },
  timezone: {
    type: 'string',
  },
  minPort: {
    type: 'number',
    int: true,
    min: 1,
  },
  maxPort: {
    type: 'number',
    int: true,
    min: 2,
  },
};

export default Settings;
