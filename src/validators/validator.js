/* eslint-disable no-restricted-syntax */
import { InvalidRequest } from '../errors/index.js';

const stringChecker = (modelRef, field, value) => {
  const min = modelRef?.min;
  if (min) {
    if (value.length < min) throw new InvalidRequest(`${field} field characters must be greater or equal to ${min}`);
  }

  const max = modelRef?.max;
  if (max) {
    if (value.length > max) throw new InvalidRequest(`${field} field characters must be less or equal to ${max}`);
  }

  const possibleValues = modelRef.values;
  if (possibleValues) {
    if (!possibleValues.includes(value)) throw new InvalidRequest(`${field} field value must be ${possibleValues}`);
  }
};

const numberChecker = (modelRef, field, value) => {
  if (modelRef.int && !Number.isInteger(value)) throw new InvalidRequest(`${field} field must be a integer value`);

  const min = modelRef?.min;
  if (min) {
    if (value < min) throw new InvalidRequest(`${field} field must be greater or equal to ${min}`);
  }

  const max = modelRef?.max;
  if (max) {
    if (value > max) throw new InvalidRequest(`${field} field must be less or equal to ${max}`);
  }
};

const requiredChecker = (entry, model) => {
  const fields = Object.keys(entry);
  for (const [key, value] of Object.entries(model)) {
    if (value.required && !fields.includes(key)) throw new InvalidRequest(`${key} field is required!`);
  }
};

const internalChecker = (modelRef, field, firstTime) => {
  if (modelRef.internal === true && !(modelRef.firstTime && firstTime)) throw new InvalidRequest(`${field} is an internal field`);
};

const desiredTypeChecker = (modelRef, field, value) => {
  const desiredType = String(modelRef.type);
  if (String(typeof value) !== desiredType) throw new InvalidRequest(`${field} field must be a ${desiredType} value`);
};

const FieldExistsChecker = (modelRef, field) => {
  if (!modelRef) throw new InvalidRequest(`${field} field is not valid!`);
};

const validator = (data, schema, isUpdate = false, firstTime = false) => {
  for (const [key, value] of Object.entries(data)) {
    const modelRef = schema[key];

    FieldExistsChecker(modelRef, key);
    internalChecker(modelRef, key, firstTime);
    desiredTypeChecker(modelRef, key, value);
    if (!isUpdate) requiredChecker(data, schema);
    if (String(modelRef.type) === 'number') numberChecker(modelRef, key, value);
    if (String(modelRef.type) === 'string') stringChecker(modelRef, key, value);
  }
};

export default validator;
