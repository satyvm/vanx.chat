import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  buildDatabaseUrlFromEnv,
  DEFAULT_POSTGRES_ENV,
  type DatabaseConfig,
} from './database-url.js';

const prismaClientPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../prisma/generated/prisma/client.js',
);

export const prismaClientModulePath = prismaClientPath;

export function loadPrismaModule() {
  return import(pathToFileURL(prismaClientPath).href);
}

export const prismaModulePromise = loadPrismaModule();

export { buildDatabaseUrlFromEnv, DEFAULT_POSTGRES_ENV };
export type { DatabaseConfig };

export type {
  Prisma,
  PrismaClient,
  User,
  Chat,
  VerificationCode,
  VerificationCodeType,
} from '../prisma/generated/prisma/client.js';
