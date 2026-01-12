import nodemailer from 'nodemailer';
import {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
} from './settings.js';

const mailer = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE === 'true',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export default mailer;
