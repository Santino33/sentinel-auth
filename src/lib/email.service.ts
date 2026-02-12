import nodemailer from 'nodemailer';

export interface EmailService {
  sendPasswordResetEmail(email: string, code: string, expiryHours?: number): Promise<void>;
  sendVerificationEmail(email: string, code: string, expiryHours?: number): Promise<void>;
}

export class NodemailerEmailService implements EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const isSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendPasswordResetEmail(email: string, code: string, expiryHours: number = 1): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@sentinel-auth.com',
      to: email,
      subject: 'Password Reset Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .email-container {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 15px rgba(0,0,0,0.05);
              border: 1px solid #e1e7ec;
            }
            .header {
              background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
              padding: 40px 20px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
              letter-spacing: -0.5px;
            }
            .content {
              padding: 40px 30px;
              color: #374151;
              line-height: 1.6;
            }
            .content p {
              margin-bottom: 24px;
              font-size: 16px;
            }
            .code-container {
              background-color: #f8fafc;
              border: 2px dashed #e2e8f0;
              border-radius: 8px;
              padding: 24px;
              text-align: center;
              margin: 30px 0;
            }
            .code-text {
              font-family: 'Courier New', Courier, monospace;
              font-size: 36px;
              font-weight: 800;
              letter-spacing: 8px;
              color: #1e293b;
              margin: 0;
            }
            .footer {
              background-color: #f9fafb;
              padding: 20px;
              text-align: center;
              font-size: 13px;
              color: #6b7280;
              border-top: 1px solid #f1f5f9;
            }
            .expiry-note {
              font-size: 14px;
              color: #ef4444;
              font-weight: 500;
              margin-top: 10px;
            }
          </style>
        </head>
        <body style="background-color: #f3f4f6; padding: 40px 0;">
          <div class="email-container">
            <div class="header">
              <h1>Sentinel Auth</h1>
            </div>
            <div class="content">
              <p>Hola,</p>
              <p>Has solicitado restablecer tu contraseña. Utiliza el siguiente código de verificación para completar el proceso:</p>
              
              <div class="code-container">
                <p class="code-text">${code}</p>
              </div>

              <p class="expiry-note">Este código expirará en <strong>${expiryHours} ${expiryHours === 1 ? 'hora' : 'horas'}</strong>.</p>
              
              <p>Si no has solicitado este cambio, puedes ignorar este correo de forma segura. Tu contraseña actual no se verá afectada.</p>
            </div>
            <div class="footer">
              Este es un correo automático, por favor no respondas directamente.<br>
              &copy; ${new Date().getFullYear()} Sentinel Auth. Todos los derechos reservados.
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('[EMAIL ERROR] Failed to send password reset email:', error);
    }
  }

  async sendVerificationEmail(email: string, code: string, expiryHours: number = 24): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@sentinel-auth.com',
      to: email,
      subject: 'Verify Your Email',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .email-container {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 15px rgba(0,0,0,0.05);
              border: 1px solid #e1e7ec;
            }
            .header {
              background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
              padding: 40px 20px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
              letter-spacing: -0.5px;
            }
            .content {
              padding: 40px 30px;
              color: #374151;
              line-height: 1.6;
            }
            .content p {
              margin-bottom: 24px;
              font-size: 16px;
            }
            .code-container {
              background-color: #f8fafc;
              border: 2px dashed #e2e8f0;
              border-radius: 8px;
              padding: 24px;
              text-align: center;
              margin: 30px 0;
            }
            .code-text {
              font-family: 'Courier New', Courier, monospace;
              font-size: 36px;
              font-weight: 800;
              letter-spacing: 8px;
              color: #1e293b;
              margin: 0;
            }
            .footer {
              background-color: #f9fafb;
              padding: 20px;
              text-align: center;
              font-size: 13px;
              color: #6b7280;
              border-top: 1px solid #f1f5f9;
            }
            .expiry-note {
              font-size: 14px;
              color: #ef4444;
              font-weight: 500;
              margin-top: 10px;
            }
          </style>
        </head>
        <body style="background-color: #f3f4f6; padding: 40px 0;">
          <div class="email-container">
            <div class="header">
              <h1>Sentinel Auth</h1>
            </div>
            <div class="content">
              <p>Welcome!</p>
              <p>Thank you for registering. Please use the following verification code to confirm your email address:</p>
              
              <div class="code-container">
                <p class="code-text">${code}</p>
              </div>

              <p class="expiry-note">This code will expire in <strong>${expiryHours} hours</strong>.</p>
              
              <p>If you didn't create an account with Sentinel Auth, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              This is an automated email, please do not reply directly.<br>
              &copy; ${new Date().getFullYear()} Sentinel Auth. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('[EMAIL] Verification email sent to:', email);
    } catch (error) {
      console.error('[EMAIL ERROR] Failed to send verification email:', error);
    }
  }
}

export class ConsoleEmailService implements EmailService {
  async sendPasswordResetEmail(email: string, code: string, expiryHours: number = 1): Promise<void> {
    console.log(`[EMAIL] To: ${email} | Code: ${code}`);
  }

  async sendVerificationEmail(email: string, code: string, expiryHours: number = 24): Promise<void> {
    console.log(`[EMAIL] Verification - To: ${email} | Code: ${code}`);
  }
}
