import nodemailer from 'nodemailer';

export interface EmailService {
  sendPasswordResetEmail(email: string, code: string): Promise<void>;
}

export class NodemailerEmailService implements EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendPasswordResetEmail(email: string, code: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@sentinel-auth.com',
      to: email,
      subject: 'Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset</h2>
          <p>You requested a password reset. Your verification code is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; letter-spacing: 4px; margin: 20px 0;">
            <strong>${code}</strong>
          </div>
          <p>This code expires in <strong>1 hour</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };
    await this.transporter.sendMail(mailOptions);
  }
}

export class ConsoleEmailService implements EmailService {
  async sendPasswordResetEmail(email: string, code: string): Promise<void> {
    console.log(`[EMAIL] To: ${email} | Code: ${code}`);
  }
}
