import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import type { PrismaClient } from '@vanx/database';
import { prismaModulePromise } from '@vanx/database';

async function loadPrismaModule() {
  return prismaModulePromise;
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private pool: pg.Pool | null = null;
  private prismaClient: PrismaClient | null = null;

  constructor(private readonly configService: ConfigService) {}

  get client(): PrismaClient {
    if (!this.prismaClient) {
      throw new Error('Prisma client is not initialized yet.');
    }
    return this.prismaClient;
  }

  async onModuleInit() {
    const databaseUrl = this.configService.get<string>('database.url');
    if (!databaseUrl) {
      throw new Error('Database URL is not configured.');
    }

    const pool = new pg.Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    const { PrismaClient } = await loadPrismaModule();
    const prisma = new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
    this.prismaClient = prisma;
    this.pool = pool;

    await prisma.$connect();
  }

  async onModuleDestroy() {
    if (this.prismaClient) {
      await this.prismaClient.$disconnect();
    }
    if (this.pool) {
      await this.pool.end();
    }
  }
}
