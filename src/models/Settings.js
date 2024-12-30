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
};

export default Settings;
