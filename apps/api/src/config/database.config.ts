import { registerAs } from '@nestjs/config';
import { buildDatabaseUrlFromEnv, type DatabaseConfig } from '@vanx/database';

export const databaseConfig = registerAs('database', (): DatabaseConfig => {
  const url = buildDatabaseUrlFromEnv();
  return { url };
});
