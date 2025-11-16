#!/usr/bin/env node
/**
 * Diagnostics script to verify critical environment variables and service connectivity.
 *
 * Usage:
 *   pnpm --filter=api env:check
 */
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import Queue from 'bull';
import { Resend } from 'resend';

const SYMBOLS = {
  pass: '✅',
  fail: '❌',
  skip: '⚪️',
};

const ENV_DEFINITIONS = [
  { key: 'DATABASE_URL', description: 'Postgres connection string', required: true },
  { key: 'REDIS_HOST', description: 'Redis hostname', required: true },
  { key: 'REDIS_PORT', description: 'Redis port', required: true },
  { key: 'REDIS_PASSWORD', description: 'Redis password', required: true },
  { key: 'JWT_SECRET', description: 'JWT signing secret', required: true },
  { key: 'WEB_APP_URL', description: 'Public web application URL', required: true },
  { key: 'RESEND_API_KEY', description: 'Resend API key', required: false },
  { key: 'RESEND_FROM_EMAIL', description: 'Resend verified sender', required: false },
];

const SERVICE_CHECKS = [
  {
    name: 'Postgres connectivity',
    requires: ['DATABASE_URL'],
    run: async () => {
      const url = requireEnv('DATABASE_URL');
      const prisma = new PrismaClient({
        datasources: {
          db: { url },
        },
      });

      try {
        await prisma.$queryRaw`SELECT 1`;
      } finally {
        await prisma.$disconnect();
      }
    },
  },
  {
    name: 'Redis connectivity',
    requires: ['REDIS_HOST', 'REDIS_PORT', 'REDIS_PASSWORD'],
    run: async () => {
      const host = requireEnv('REDIS_HOST');
      const port = parsePort(requireEnv('REDIS_PORT'));
      const password = requireEnv('REDIS_PASSWORD');

      const queue = new Queue('env-check', {
        redis: {
          host,
          port,
          password,
        },
      });

      try {
        await queue.waitUntilReady();
        const client = await queue.client;
        const pong = await client.ping();
        if (pong !== 'PONG') {
          throw new Error(`Unexpected PING response: ${pong}`);
        }
      } finally {
        await queue.close();
      }
    },
  },
  {
    name: 'Resend API connectivity',
    requires: ['RESEND_API_KEY', 'RESEND_FROM_EMAIL'],
    run: async () => {
      const apiKey = requireEnv('RESEND_API_KEY');
      const from = extractEmailAddress(requireEnv('RESEND_FROM_EMAIL'));
      const resend = new Resend(apiKey);

      const domainsResponse = await resend.domains.list({ limit: 100 });
      if (domainsResponse.error) {
        throw new Error(
          `API error ${domainsResponse.error.statusCode ?? ''} ${domainsResponse.error.name}: ${domainsResponse.error.message}`,
        );
      }

      const domain = getDomainFromEmail(from);
      if (!domain) {
        throw new Error('RESEND_FROM_EMAIL must contain an email address.');
      }

      if (domain.endsWith('resend.dev')) {
        return;
      }

      const matchingDomain = domainsResponse.data?.data?.find(
        (candidate) => candidate.name.toLowerCase() === domain,
      );

      if (!matchingDomain) {
        throw new Error(
          `Domain "${domain}" is not registered in Resend. Add it in the Resend dashboard or use onboarding@resend.dev.`,
        );
      }

      if (matchingDomain.status !== 'verified') {
        throw new Error(
          `Domain "${domain}" is ${matchingDomain.status}. Complete domain verification in Resend before sending emails.`,
        );
      }
    },
  },
];

function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not defined`);
  }
  return value;
}

function parsePort(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid port "${value}"`);
  }
  return parsed;
}

function extractEmailAddress(value) {
  const trimmed = value.trim();
  const match = trimmed.match(/<([^>]+)>/);
  return (match ? match[1] : trimmed).trim();
}

function getDomainFromEmail(email) {
  const atIndex = email.lastIndexOf('@');
  if (atIndex === -1) return null;
  return email.slice(atIndex + 1).toLowerCase();
}

function loadEnvFiles() {
  const __filename = fileURLToPath(import.meta.url);
  const scriptDir = path.dirname(__filename);
  const repoRoot = findRepoRoot(scriptDir);
  const apiDir = path.resolve(scriptDir, '..');

  const candidates = [
    path.join(repoRoot, '.env.local'),
    path.join(repoRoot, '.env'),
    path.join(apiDir, '.env.local'),
    path.join(apiDir, '.env'),
  ];

  const loaded = [];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    applyEnvFile(file);
    loaded.push(file);
  }

  if (loaded.length > 0) {
    console.log('Loaded environment files:');
    for (const file of loaded) {
      const relative = path.relative(repoRoot, file);
      console.log(`  - ${relative.startsWith('..') ? file : relative}`);
    }
    console.log('');
  } else {
    console.log('No .env files found next to the repo root or apps/api. Relying on process env.\n');
  }
}

function applyEnvFile(filePath) {
  const contents = readFileSync(filePath, 'utf8');
  const lines = contents.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const normalized = line.startsWith('export ') ? line.slice(7).trim() : line;
    const eqIndex = normalized.indexOf('=');
    if (eqIndex === -1) continue;

    const key = normalized.slice(0, eqIndex).trim();
    let value = normalized.slice(eqIndex + 1).trim();

    if (!key || key.startsWith('#')) continue;
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function findRepoRoot(startDir) {
  let current = startDir;
  while (true) {
    if (
      existsSync(path.join(current, 'pnpm-workspace.yaml')) ||
      existsSync(path.join(current, '.git'))
    ) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return startDir;
    }
    current = parent;
  }
}

async function runChecks() {
  loadEnvFiles();

  console.log('Environment variable checks:');
  const missingRequired = [];
  for (const definition of ENV_DEFINITIONS) {
    const value = process.env[definition.key];
    if (value && value.length > 0) {
      logStatus('pass', `${definition.key} – ${definition.description}`);
      continue;
    }

    if (definition.required) {
      logStatus('fail', `${definition.key} is missing (${definition.description})`);
      missingRequired.push(definition.key);
    } else {
      logStatus(
        'skip',
        `${definition.key} is not set (optional) – ${definition.description}`,
      );
    }
  }

  console.log('\nConnectivity checks:');
  const serviceFailures = [];
  for (const check of SERVICE_CHECKS) {
    const missing = check.requires.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      logStatus(
        'skip',
        `${check.name} skipped (missing env: ${missing.join(', ')})`,
      );
      continue;
    }

    try {
      await check.run();
      logStatus('pass', check.name);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      serviceFailures.push(`${check.name}: ${message}`);
      logStatus('fail', `${check.name} – ${message}`);
    }
  }

  if (missingRequired.length || serviceFailures.length) {
    console.log('\nSummary:');
    if (missingRequired.length) {
      console.log(`- Missing required env vars: ${missingRequired.join(', ')}`);
    }
    if (serviceFailures.length) {
      for (const failure of serviceFailures) {
        console.log(`- ${failure}`);
      }
    }
    process.exitCode = 1;
  } else {
    console.log('\nAll checks passed ✅');
  }
}

function logStatus(status, message) {
  console.log(`${SYMBOLS[status]} ${message}`);
}

runChecks().catch((error) => {
  console.error('\nUnexpected error while running environment checks.');
  console.error(error);
  process.exitCode = 1;
});
