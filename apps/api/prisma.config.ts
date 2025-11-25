import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import { buildDatabaseUrlFromEnv } from './src/config/database.config.js';

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
});
