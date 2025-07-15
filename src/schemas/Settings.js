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
    min: 100,
  },
  maxPort: {
    type: 'number',
    int: true,
    min: 101,
  },
  permissions: {
    type: 'array',
    internal: true,
  },
};

export default Settings;
