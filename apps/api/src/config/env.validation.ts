import { buildDatabaseUrlFromEnv } from '@vanx/database';
import { buildRedisConfigFromEnv } from './redis.config.js';

export function validateEnv(config: Record<string, unknown>) {
  buildDatabaseUrlFromEnv(config as NodeJS.ProcessEnv);
  buildRedisConfigFromEnv(config as NodeJS.ProcessEnv);
  return config;
}
