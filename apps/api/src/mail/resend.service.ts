import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import {
  PasswordResetEmailPayload,
  VerificationEmailPayload,
} from './mail.service';
import { passwordResetTemplate, verificationEmailTemplate } from './templates';

@Injectable()
export class ResendService {
  private readonly resend: Resend | null;
  private readonly fromEmail: string | undefined;
  private readonly logger = new Logger(ResendService.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL');
    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  async sendVerificationEmail(payload: VerificationEmailPayload) {
    await this.dispatchEmail(verificationEmailTemplate(payload), payload.email);
  }

  async sendPasswordResetEmail(payload: PasswordResetEmailPayload) {
    await this.dispatchEmail(passwordResetTemplate(payload), payload.email);
  }

  private async dispatchEmail(
    template: { subject: string; html: string; text: string },
    recipient: string,
  ) {
    if (!this.resend || !this.fromEmail) {
      this.logger.warn(
        'Resend credentials missing; logging email contents for debugging.',
      );
      this.logFallbackEmail(template, recipient);
      return;
    }

    await this.resend.emails.send({
      from: this.fromEmail,
      to: recipient,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  private logFallbackEmail(
    template: { subject: string; html: string; text: string },
    recipient: string,
  ) {
    this.logger.log(
      `Email to ${recipient} (${template.subject}): ${template.text}`,
    );
  }
}
