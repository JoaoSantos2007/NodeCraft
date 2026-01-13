import { SMTP_USER } from '../../config/settings.js';
import mailer from '../../config/mailer.js';

const sendEmail = async ({
  to, subject, html, text = '',
}) => {
  await mailer.verify();

  await mailer.sendMail({
    from: `"Nodecraft API " <${SMTP_USER}>`,
    to,
    subject,
    html,
    text,
  });
};

export default sendEmail;
