import 'dotenv/config';
import type { PrismaConfig } from 'prisma';
import { defineConfig } from 'prisma/config';

import { buildDatabaseUrlFromEnv } from './src/database-url';

const databaseUrl = buildDatabaseUrlFromEnv();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'pnpm exec tsx prisma/seed.ts',
  },
  datasource: {
    url: databaseUrl,
  },
}) satisfies PrismaConfig;
