/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-destructuring */
import { InvalidRequest } from '../errors/index.js';

const stringChecker = (modelRef, field, value) => {
  const min = modelRef.min;
  if (min) {
    if (value.length < min) throw new InvalidRequest(`${field} field characters must be greater or equal to ${min}`);
  }

  const max = modelRef.max;
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

  const min = modelRef.min;
  if (min) {
    if (value < min) throw new InvalidRequest(`${field} field must be greater or equal to ${min}`);
  }

  const max = modelRef.max;
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

const internalChecker = (entry, model, obj) => {
  const fields = Object.keys(entry);
  for (const [key, value] of Object.entries(model)) {
    if (value.internal && fields.includes(key)) entry[key] = obj[key];
  }
};

const instanceTypeChecker = (modelRef, field, type) => {
  if (modelRef.onlyBedrock && type !== 'bedrock') throw new InvalidRequest(`${field} field is only available for bedrock instances`);
  if (modelRef.onlyJava && type !== 'java') throw new InvalidRequest(`${field} field is only available for java instances`);
};

const validator = (entry, model, obj = null, instanceType = null) => {
  instanceType = instanceType || obj?.type;

  for (const [key, value] of Object.entries(entry)) {
    const modelRef = model[key];
    if (!modelRef) throw new InvalidRequest(`${key} field is not valid!`);
    const desiredType = String(modelRef.type);

    if (instanceType) instanceTypeChecker(modelRef, key, instanceType);
    if (String(typeof value) !== desiredType) throw new InvalidRequest(`${key} field must be a ${desiredType} value`);
    if (desiredType === 'number') numberChecker(modelRef, key, value);
    if (desiredType === 'string') stringChecker(modelRef, key, value);
    if (!obj) requiredChecker(entry, model);
    if (obj) internalChecker(entry, model, obj);
  }
};

export default validator;
