import { SMTP_HOST, SMTP_PASSWORD, SMTP_USER } from '@/config';
import { logger } from '@/utils/logger';
import nodemailer from 'nodemailer';

class EmailSender {
  async send(email: string, subject: string, text: string) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: SMTP_USER,
        to: email,
        subject: subject,
        text: text,
      });
    } catch (error) {
      logger.error(error, 'email not sent');
    }
  }
}

const emailSender = new EmailSender();
export default emailSender;
