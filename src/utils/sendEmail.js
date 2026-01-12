import { SMTP_USER } from '../../config/settings.js';
import mailer from '../../config/mailer.js';

const sendEmail = async ({ to, subject, html }) => {
  await mailer.verify();

  await mailer.sendMail({
    from: `"Nodecraft API " <${SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;
