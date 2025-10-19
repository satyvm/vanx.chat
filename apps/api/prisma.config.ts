import path from 'node:path';
import 'dotenv/config';
import type { PrismaConfig } from 'prisma';

export default {
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'pnpm exec ts-node prisma/seed.ts',
  },
  views: {
    path: path.join('prisma', 'views'),
  },
  typedSql: {
    path: path.join('prisma', 'queries'),
  },
} satisfies PrismaConfig;
