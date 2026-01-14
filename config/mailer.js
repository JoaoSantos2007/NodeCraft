import nodemailer from 'nodemailer';
import config from './index.js';

const mailer = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure === 'true',
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

export default mailer;
