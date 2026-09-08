import mailer from '../../config/mailer.js';
import config from '../../config/config.js';
import { ServiceUnavailable } from '../errors/index.js';

const sendEmail = async ({
  to, subject, html, text,
}) => {
  if (!config.email.enable) throw new ServiceUnavailable('Email service is not set!');

  await mailer.sendMail({
    from: `"${config.email.fromName}" <${config.email.user}>`,
    to,
    subject,
    html,
    ...(text ? { text } : {}),
  });
};

export default sendEmail;
