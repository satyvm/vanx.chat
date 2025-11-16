import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { VerificationCodeType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const CODE_LENGTH = 6;
const DEFAULT_EXPIRATION_MINUTES = 10;

export interface CreateCodeOptions {
  email: string;
  userId?: string;
  type: VerificationCodeType;
  expiresInMinutes?: number;
}

export interface VerifyCodeOptions {
  email: string;
  code: string;
  type: VerificationCodeType;
}

@Injectable()
export class VerificationCodesService {
  constructor(private readonly prisma: PrismaService) {}

  async createCode(options: CreateCodeOptions) {
    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(
      Date.now() +
        1000 * 60 * (options.expiresInMinutes ?? DEFAULT_EXPIRATION_MINUTES),
    );

    await this.prisma.verificationCode.create({
      data: {
        email: this.normalizeEmail(options.email),
        codeHash,
        type: options.type,
        userId: options.userId,
        expiresAt,
      },
    });

    return { code, expiresAt };
  }

  async verifyCode(options: VerifyCodeOptions) {
    const record = await this.prisma.verificationCode.findFirst({
      where: {
        email: this.normalizeEmail(options.email),
        type: options.type,
        consumedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new BadRequestException('Verification code not found');
    }

    if (record.expiresAt.getTime() < Date.now()) {
      await this.consume(record.id);
      throw new BadRequestException('Verification code expired');
    }

    const match = await bcrypt.compare(options.code, record.codeHash);
    if (!match) {
      await this.incrementAttempts(record.id);
      throw new BadRequestException('Invalid verification code');
    }

    await this.consume(record.id);
    return record;
  }

  private async consume(id: string) {
    try {
      await this.prisma.verificationCode.update({
        where: { id },
        data: { consumedAt: new Date(), attempts: { increment: 1 } },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Unable to update verification code',
      );
    }
  }

  private async incrementAttempts(id: string) {
    await this.prisma.verificationCode.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private generateCode() {
    const min = 10 ** (CODE_LENGTH - 1);
    const max = 10 ** CODE_LENGTH - 1;
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
  }
}
