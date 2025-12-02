import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import type { Prisma } from '@vanx/database';
import { Response } from 'express';
import { prismaModulePromise } from '@vanx/database';

@Catch()
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  async catch(exception: unknown, host: ArgumentsHost) {
    const { Prisma } = await prismaModulePromise;
    if (!(exception instanceof Prisma.PrismaClientKnownRequestError)) {
      return super.catch(exception, host);
    }
    const prismaException = exception as Prisma.PrismaClientKnownRequestError;
    console.error(prismaException.message);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = prismaException.message.replace(/\n/g, '');
    switch (prismaException.code) {
      case 'P2002': {
        const status = HttpStatus.CONFLICT;
        response.status(status).json({
          statusCode: status,
          message: message,
        });
        break;
      }
      case 'P2025': {
        const status = HttpStatus.NOT_FOUND;
        response.status(status).json({
          statusCode: status,
          message: message,
        });
        break;
      }
      default:
        super.catch(exception, host);
        break;
    }
  }
}
