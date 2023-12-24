import NodeCraft from '../model/NodeCraft.js';
import Bedrock from '../model/Bedrock.js';
import Java from '../model/Java.js';
import InvalidRequestError from '../errors/InvalidRequest.js';

const analize = (analizedAttribute, field, value) => {
  if (!analizedAttribute) throw new InvalidRequestError(`${field} field is not valid`);

  const desiredType = String(analizedAttribute.type);
  if (String(typeof value) !== desiredType) throw new InvalidRequestError(`${field} field must be a ${desiredType} value`);

  // For numbers
  if (desiredType === 'number') {
    if (analizedAttribute.int && !Number.isInteger(value)) throw new InvalidRequestError(`${field} field must be a integer value`);

    // eslint-disable-next-line prefer-destructuring
    const min = analizedAttribute.min;
    if (min) {
      if (value < min) throw new InvalidRequestError(`${field} field must be greater or equal to ${min}`);
    }

    // eslint-disable-next-line prefer-destructuring
    const max = analizedAttribute.max;
    if (max) {
      if (value > max) throw new InvalidRequestError(`${field} field must be less or equal to ${max}`);
    }
  }

  // For strings
  if (desiredType === 'string') {
    // eslint-disable-next-line prefer-destructuring
    const min = analizedAttribute.min;
    if (min) {
      if (value.length < min) throw new InvalidRequestError(`${field} field characters must be greater or equal to ${min}`);
    }

    // eslint-disable-next-line prefer-destructuring
    const max = analizedAttribute.max;
    if (max) {
      if (value.length > max) throw new InvalidRequestError(`${field} field characters must be less or equal to ${max}`);
    }

    const possibleValues = analizedAttribute.values;
    if (possibleValues) {
      if (!possibleValues.includes(value)) throw new InvalidRequestError(`${field} field value must be ${possibleValues}`);
    }
  }
};

const validate = (data, instance = null) => {
  // Define Instance type
  let type = null;
  if (instance) type = instance.type;
  else type = data.type;

  // If instance not exists, verify required fields
  if (!instance) {
    const fields = Object.keys(data);
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(NodeCraft)) {
      if (value.required && !fields.includes(key)) throw new InvalidRequestError(`${key} field is required!`);
    }
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(data)) {
    const analizedAttribute = NodeCraft[key];
    analize(analizedAttribute, key, value);

    // Analize Properties Object
    if (key === 'properties') {
      const { properties } = data;
      // eslint-disable-next-line no-restricted-syntax
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
