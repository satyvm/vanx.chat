import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import {
  EmailJob,
  EMAIL_QUEUE,
  PasswordResetEmailPayload,
  VerificationEmailPayload,
} from './mail.service';
import { ResendService } from './resend.service';

@Processor(EMAIL_QUEUE)
export class MailProcessor {
  constructor(private readonly resendService: ResendService) {}

  @Process(EmailJob.Verification)
  async handleVerification(job: Job<VerificationEmailPayload>) {
    await this.resendService.sendVerificationEmail(job.data);
  }

  @Process(EmailJob.PasswordReset)
  async handlePasswordReset(job: Job<PasswordResetEmailPayload>) {
    await this.resendService.sendPasswordResetEmail(job.data);
  }
}
