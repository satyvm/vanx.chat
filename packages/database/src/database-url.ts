export interface DatabaseConfig {
  url: string;
}

export const DEFAULT_POSTGRES_ENV = {
  POSTGRES_USER: 'vanx',
  POSTGRES_PASSWORD: 'vanx',
  POSTGRES_HOST: 'localhost',
  POSTGRES_DB: 'vanx',
  POSTGRES_PORT: '5432',
} as const;

export function buildDatabaseUrlFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const directUrl = env.DATABASE_URL?.trim();
  if (directUrl) {
    return directUrl;
  }

  const user = env.POSTGRES_USER?.trim() || DEFAULT_POSTGRES_ENV.POSTGRES_USER;
  const password =
    env.POSTGRES_PASSWORD ?? DEFAULT_POSTGRES_ENV.POSTGRES_PASSWORD;
  const host = env.POSTGRES_HOST?.trim() || DEFAULT_POSTGRES_ENV.POSTGRES_HOST;
  const db = env.POSTGRES_DB?.trim() || DEFAULT_POSTGRES_ENV.POSTGRES_DB;
  const port = env.POSTGRES_PORT?.trim() || DEFAULT_POSTGRES_ENV.POSTGRES_PORT;

  if (user && host && db) {
    const safePassword = String(password);
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(
      safePassword,
    )}@${host}:${port}/${db}`;
  }

  throw new Error(
    'DATABASE_URL is not set. Provide DATABASE_URL or POSTGRES_* environment variables to generate it.',
  );
}
