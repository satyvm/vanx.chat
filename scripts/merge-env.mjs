#!/usr/bin/env node

/**
 * Merges new variables from .env.example into .env while preserving existing values
 * This helps keep your .env file up-to-date when the team updates .env.example
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = resolve(__dirname, '..');
const ENV_EXAMPLE = resolve(ROOT_DIR, '.env.example');
const ENV_FILE = resolve(ROOT_DIR, '.env');
const ENV_BACKUP = resolve(ROOT_DIR, '.env.backup');

/**
 * Parses an env file into a structured format
 * @param {string} content - File content
 * @returns {Array<{type: string, content: string, key?: string, value?: string}>}
 */
function parseEnvFile(content) {
  const lines = content.split('\n');
  const parsed = [];

  lines.forEach(line => {
    const trimmed = line.trim();

    if (trimmed === '' || trimmed.startsWith('#')) {
      parsed.push({ type: 'comment', content: line });
    } else {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2];
        parsed.push({ type: 'variable', content: line, key, value });
      } else {
        parsed.push({ type: 'comment', content: line });
      }
    }
  });

  return parsed;
}

/**
 * Extracts variables from parsed env data
 * @param {Array} parsed - Parsed env data
 * @returns {Map<string, string>}
 */
function extractVariables(parsed) {
  const vars = new Map();
  parsed.forEach(item => {
    if (item.type === 'variable') {
      vars.set(item.key, item.value);
    }
  });
  return vars;
}

/**
 * Merges .env.example into .env
 */
function mergeEnv() {
  console.log('\n📝 Merging .env.example into .env...\n');

  if (!existsSync(ENV_EXAMPLE)) {
    console.error('✗ .env.example not found');
    process.exit(1);
  }

  const exampleContent = readFileSync(ENV_EXAMPLE, 'utf-8');
  const exampleParsed = parseEnvFile(exampleContent);
  const exampleVars = extractVariables(exampleParsed);

  let envVars = new Map();
  let envExists = existsSync(ENV_FILE);

  if (envExists) {
    const envContent = readFileSync(ENV_FILE, 'utf-8');
    const envParsed = parseEnvFile(envContent);
    envVars = extractVariables(envParsed);

    writeFileSync(ENV_BACKUP, envContent);
    console.log(`💾 Backup created: .env.backup\n`);
  } else {
    console.log('📄 No existing .env file found. Creating new one.\n');
  }

  const newVars = [];
  const updatedVars = [];
  const preservedVars = [];
  const orphanedVars = [];

  const finalParsed = [];

  exampleParsed.forEach(item => {
    if (item.type === 'comment') {
      finalParsed.push(item);
    } else if (item.type === 'variable') {
      const key = item.key;

      if (envVars.has(key)) {
        const existingValue = envVars.get(key);
        finalParsed.push({
          type: 'variable',
          content: `${key}=${existingValue}`,
          key,
          value: existingValue
        });
        preservedVars.push(key);
        envVars.delete(key);
      } else {
        finalParsed.push(item);
        newVars.push({ key, value: item.value });
      }
    }
  });

  envVars.forEach((value, key) => {
    orphanedVars.push({ key, value });
  });

  if (orphanedVars.length > 0) {
    finalParsed.push({ type: 'comment', content: '' });
    finalParsed.push({ type: 'comment', content: '# Variables not in .env.example (review and remove if no longer needed)' });
    orphanedVars.forEach(({ key, value }) => {
      finalParsed.push({
        type: 'variable',
        content: `${key}=${value}`,
        key,
        value
      });
    });
  }

  const finalContent = finalParsed.map(item => item.content).join('\n');
  writeFileSync(ENV_FILE, finalContent);

  console.log('📊 Merge Summary:');
  console.log(`   ✓ Preserved: ${preservedVars.length} variables`);
  console.log(`   + Added: ${newVars.length} new variables`);

  if (newVars.length > 0) {
    console.log('\n   New variables added:');
    newVars.forEach(({ key, value }) => {
      console.log(`     • ${key}=${value || '(empty)'}`);
    });
  }

  if (orphanedVars.length > 0) {
    console.log(`\n   ⚠ Orphaned: ${orphanedVars.length} variables (not in .env.example)`);
    console.log('   These were kept at the bottom of .env - review them:');
    orphanedVars.forEach(({ key }) => {
      console.log(`     • ${key}`);
    });
  }

  console.log('\n✨ Done! Your .env file has been updated.\n');

  if (newVars.length > 0) {
    console.log('💡 Don\'t forget to fill in values for new variables!\n');
  }
}

mergeEnv();
