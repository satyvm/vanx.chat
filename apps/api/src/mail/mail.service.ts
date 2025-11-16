import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

export const EMAIL_QUEUE = 'email';

export enum EmailJob {
  Verification = 'verification-email',
  PasswordReset = 'password-reset-email',
}

export interface VerificationEmailPayload {
  email: string;
  name: string;
  code: string;
}

export interface PasswordResetEmailPayload {
  email: string;
  name: string;
  code: string;
}

@Injectable()
export class MailService {
  constructor(@InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue) {}

  async queueVerificationEmail(payload: VerificationEmailPayload) {
    await this.emailQueue.add(EmailJob.Verification, payload, {
      removeOnComplete: true,
      attempts: 3,
    });
  }

  async queuePasswordResetEmail(payload: PasswordResetEmailPayload) {
    await this.emailQueue.add(EmailJob.PasswordReset, payload, {
      removeOnComplete: true,
      attempts: 3,
    });
  }
}
