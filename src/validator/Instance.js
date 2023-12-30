/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-destructuring */
import Instance from '../model/Instance.js';
import Bedrock from '../model/Bedrock.js';
import Java from '../model/Java.js';
import { InvalidRequest } from '../errors/index.js';

const stringChecker = (analizedAttribute, field, value) => {
  const min = analizedAttribute.min;
  if (min) {
    if (value.length < min) throw new InvalidRequest(`${field} field characters must be greater or equal to ${min}`);
  }

  const max = analizedAttribute.max;
  if (max) {
    if (value.length > max) throw new InvalidRequest(`${field} field characters must be less or equal to ${max}`);
  }

  const possibleValues = analizedAttribute.values;
  if (possibleValues) {
    if (!possibleValues.includes(value)) throw new InvalidRequest(`${field} field value must be ${possibleValues}`);
  }
};

const numberChecker = (analizedAttribute, field, value) => {
  if (analizedAttribute.int && !Number.isInteger(value)) throw new InvalidRequest(`${field} field must be a integer value`);

  const min = analizedAttribute.min;
  if (min) {
    if (value < min) throw new InvalidRequest(`${field} field must be greater or equal to ${min}`);
  }

  const max = analizedAttribute.max;
  if (max) {
    if (value > max) throw new InvalidRequest(`${field} field must be less or equal to ${max}`);
  }
};

const analize = (analizedAttribute, field, value) => {
  if (!analizedAttribute) throw new InvalidRequest(`${field} field is not valid!`);
  const desiredType = String(analizedAttribute.type);

  if (String(typeof value) !== desiredType) throw new InvalidRequest(`${field} field must be a ${desiredType} value`);
  if (desiredType === 'number') numberChecker(analizedAttribute, field, value);
  if (desiredType === 'string') stringChecker(analizedAttribute, field, value);
};

const validate = (data, instance = null) => {
  // Define Instance type
  const type = instance.type || data.type;

  // If instance not exists, verify required fields
  if (!instance) {
    const fields = Object.keys(data);
    for (const [key, value] of Object.entries(Instance)) {
      if (value.required && !fields.includes(key)) throw new InvalidRequest(`${key} field is required!`);
    }
  }

  // If instance exists, verify internal fields
  if (instance) {
    const fields = Object.keys(data);
    for (const [key, value] of Object.entries(Instance)) {
      if (value.internal && fields.includes(key)) throw new InvalidRequest(`${key} is a internal field!`);
    }
  }

  for (const [key, value] of Object.entries(data)) {
    const analizedAttribute = Instance[key];
    analize(analizedAttribute, key, value);

    // Analize Properties Object
    if (key === 'properties') {
      const { properties } = data;
      for (const [propertieKey, propertieValue] of Object.entries(properties)) {
        let analizedPropertie = null;
        if (type === 'bedrock') analizedPropertie = Bedrock[propertieKey];
        else if (type === 'java') analizedPropertie = Java[propertieKey];

        analize(analizedPropertie, `${key}.${propertieKey}`, propertieValue);
      }
    }
  }
};

export default validate;
