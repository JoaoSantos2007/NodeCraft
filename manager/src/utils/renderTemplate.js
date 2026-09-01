import { readFile } from 'node:fs/promises';
import { Internal } from '../errors/index.js';
import logger from '../../config/logger.js';

const TEMPLATES = new URL('../templates/', import.meta.url);
const ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ESCAPES[char]);

const renderTemplate = async (templateName, variables = {}) => {
  let template;

  try {
    template = await readFile(new URL(templateName, TEMPLATES), 'utf8');
  } catch (err) {
    logger.error({ err, templateName }, 'Failed to read email template');

    throw new Internal(`Email template "${templateName}" could not be read`);
  }

  return template.replace(/{{(\w+)}}/g, (placeholder, key) => {
    const value = variables[key];

    if (value === undefined) {
      throw new Internal(`Email template "${templateName}" is missing: ${key}`);
    }

    return escapeHtml(value);
  });
};

export default renderTemplate;
