import { readFileSync } from 'fs';
import { ABSOLUTE_PATH } from '../../config/settings.js';

const renderTemplate = (templateName, variables = {}) => {
  const filePath = `${ABSOLUTE_PATH}/src/templates/emails/${templateName}`;
  let html = readFileSync(filePath, 'utf8');

  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, value);
  }

  return html;
};

const renderVerifyTemplate = (link, name = 'usuário') => {
  const html = renderTemplate('verify.html', {
    name: name || 'usuário',
    link,
    year: new Date().getFullYear(),
  });

  return html;
};

const renderResetTemplate = (link, name = 'usuário') => {
  const html = renderResetTemplate('reset.htmk', {
    name: name || 'usuário',
    link,
    expires: '1h',
    year: new Date().getFullYear(),
  });

  return html;
};

export {
  renderTemplate,
  renderVerifyTemplate,
  renderResetTemplate,
};
