import { readFileSync } from 'fs';
import config from '../../config/index.js';

const renderTemplate = (templateName, variables = {}) => {
  const filePath = `${config.absoutePath}/src/templates/emails/${templateName}`;
  let html = readFileSync(filePath, 'utf8');

  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, value);
  }

  return html;
};

export default renderTemplate;
