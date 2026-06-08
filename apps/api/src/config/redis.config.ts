import { registerAs } from '@nestjs/config';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}

const DEFAULT_REDIS_ENV = {
  REDIS_HOST: '127.0.0.1',
  REDIS_PORT: '6379',
} as const;

export function buildRedisConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): RedisConfig {
  const host = env.REDIS_HOST?.trim() || DEFAULT_REDIS_ENV.REDIS_HOST;
  const portString = env.REDIS_PORT?.trim() || DEFAULT_REDIS_ENV.REDIS_PORT;
  const port = Number(portString);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid REDIS_PORT value "${portString}"`);
  }

  const password = env.REDIS_PASSWORD?.trim();

  return {
    host,
    port,
    password: password?.length ? password : undefined,
  };
}

export const redisConfig = registerAs(
  'redis',
  (): RedisConfig => buildRedisConfigFromEnv(),
);
