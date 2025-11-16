#!/usr/bin/env node

/**
 * Creates symlinks from app-level .env files to the root .env file
 * This ensures a single source of truth for environment variables
 */

import { existsSync, lstatSync, unlinkSync, symlinkSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = resolve(__dirname, '..');
const ROOT_ENV = resolve(ROOT_DIR, '.env');

const APPS = [
  'apps/api',
  'apps/web',
  'apps/www'
];

/**
 * Creates a symlink from target to source
 * @param {string} source - Path to the source file (root .env)
 * @param {string} target - Path to the target location (app .env)
 */
function createSymlink(source, target) {
  const targetDir = dirname(target);
  const relativeSource = relative(targetDir, source);

  // Remove existing file/symlink if it exists
  if (existsSync(target)) {
    const stats = lstatSync(target);
    if (stats.isSymbolicLink()) {
      console.log(`  ✓ Removing existing symlink: ${target}`);
      unlinkSync(target);
    } else {
      console.log(`  ⚠ Warning: ${target} exists as a regular file. Remove it manually if you want to use symlinks.`);
      return false;
    }
  }

  try {
    symlinkSync(relativeSource, target);
    console.log(`  ✓ Created symlink: ${target} -> ${relativeSource}`);
    return true;
  } catch (err) {
    console.error(`  ✗ Failed to create symlink: ${target}`);
    console.error(`    Error: ${err.message}`);
    return false;
  }
}

/**
 * Main function to sync environment files
 */
function syncEnv() {
  console.log('\n🔗 Syncing environment files...\n');

  // Check if root .env exists
  if (!existsSync(ROOT_ENV)) {
    console.error(`✗ Root .env file not found at ${ROOT_ENV}`);
    console.log('  Create a .env file at the root of your project first.');
    process.exit(1);
  }

  console.log(`📄 Source: ${ROOT_ENV}\n`);

  let successCount = 0;
  let totalCount = 0;

  // Create symlinks for each app
  APPS.forEach(app => {
    const appEnv = resolve(ROOT_DIR, app, '.env');
    totalCount++;

    console.log(`${app}:`);
    if (createSymlink(ROOT_ENV, appEnv)) {
      successCount++;
    }
    console.log('');
  });

  // Summary
  console.log('─'.repeat(50));
  console.log(`\n✨ Done! ${successCount}/${totalCount} symlinks created.\n`);

  if (successCount < totalCount) {
    console.log('⚠️  Some symlinks could not be created. Check warnings above.\n');
  }
}

// Run the script
syncEnv();
