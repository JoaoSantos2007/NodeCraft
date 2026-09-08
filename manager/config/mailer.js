import nodemailer from 'nodemailer';
import config from './config.js';
import logger from './logger.js';

const mailer = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

const verifyMailer = async () => {
  if (!config.email.enable) return false;

  try {
    await mailer.verify();
    logger.info({ host: config.email.host }, 'Email service is ready');

    return true;
  } catch (err) {
    logger.error({ err, host: config.email.host }, 'Email service failed to verify');

    return false;
  }
};

export { verifyMailer };
export default mailer;
