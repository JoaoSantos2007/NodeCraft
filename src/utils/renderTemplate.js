import { readFileSync } from 'fs';
import Path from 'path';
import config from '../../config/index.js';

const renderTemplate = (templateName, variables = {}) => {
  const filePath = Path.resolve(config.absoutePath, 'src', 'templates', templateName);
  let template = readFileSync(filePath, 'utf8');

  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    template = template.replace(regex, value);
  }

  return template;
};

export default renderTemplate;
