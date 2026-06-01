import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailConfig = this.configService.get('email');
    if (emailConfig?.host) {
      this.transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: {
          user: emailConfig.user,
          pass: emailConfig.password,
        },
      });
    } else {
      // Mock transporter for development
      this.transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 1025,
      });
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    message: string,
    htmlContent?: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const mailOptions = {
        from: this.configService.get('email.from') || 'noreply@schoolmanagement.com',
        to,
        subject,
        text: message,
        html: htmlContent || message,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${to}`, info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      return { success: false, error: error.message };
    }
  }

  async sendBulkEmail(
    recipients: string[],
    subject: string,
    message: string,
    htmlContent?: string,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const results: { success: number; failed: number; errors: string[] } = { success: 0, failed: 0, errors: [] };

    for (const email of recipients) {
      const result = await this.sendEmail(email, subject, message, htmlContent);
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push(`${email}: ${result.error}`);
      }
    }

    return results;
  }
}
