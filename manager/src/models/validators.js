import config from '../../config/config.js';

const isStringArray = (label) => function validateStringArray(value) {
  if (!Array.isArray(value)) {
    throw new Error(`${label} field must be an array!`);
  }

  if (!value.every((item) => typeof item === 'string')) {
    throw new Error(`${label} must contain only strings!`);
  }
};

const isPermissionArray = (label) => function validatePermissionArray(value) {
  isStringArray(label).call(this, value);

  value.forEach((item) => {
    if (!config.instance.permissions.includes(item)) {
      throw new Error(`${item} is an invalid permission!`);
    }
  });
};

export { isStringArray, isPermissionArray };
