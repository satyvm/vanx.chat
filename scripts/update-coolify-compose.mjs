#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const COOLIFY_STACK_NAME = "vanx-chat-coolify";
const SOURCE_FILE = "docker-compose.yml";
const TARGET_FILE = "docker-compose.coolify.yml";

const repoRoot = path.resolve(
  path.join(path.dirname(fileURLToPath(import.meta.url)), ".."),
);
const sourcePath = path.join(repoRoot, SOURCE_FILE);
const targetPath = path.join(repoRoot, TARGET_FILE);

if (!fs.existsSync(sourcePath)) {
  console.error(`Could not find ${SOURCE_FILE} in ${repoRoot}`);
  process.exit(1);
}

const original = fs.readFileSync(sourcePath, "utf8");

const namePattern = /^name:\s+.*$/m;
const withCoolifyName = namePattern.test(original)
  ? original.replace(namePattern, `name: ${COOLIFY_STACK_NAME}`)
  : `name: ${COOLIFY_STACK_NAME}\n\n${original}`;

const lines = withCoolifyName.split(/\r?\n/);
const outputLines = [];

for (let i = 0; i < lines.length; i += 1) {
  const line = lines[i];
  const match = line.match(/^(\s*)ports:\s*$/);

  if (!match) {
    outputLines.push(line);
    continue;
  }

  const indent = match[1];
  const childIndent = `${indent}  `;
  const portEntries = [];
  let cursor = i + 1;

  while (cursor < lines.length) {
    const candidate = lines[cursor];
    const candidateTrimmed = candidate.trim();

    if (!candidateTrimmed || !candidateTrimmed.startsWith("- ")) {
      break;
    }

    const candidateIndent = candidate.replace(candidateTrimmed, "");
    if (!candidateIndent.startsWith(childIndent)) {
      break;
    }

    portEntries.push(candidateTrimmed.slice(2));
    cursor += 1;
  }

  if (!portEntries.length) {
    // Nothing to convert—just skip the "ports:" key and continue.
    i = cursor - 1;
    continue;
  }

  const exposed = dedupe(
    portEntries
      .map(parseContainerPort)
      .filter(Boolean),
  );

  if (exposed.length) {
    outputLines.push(`${indent}expose:`);
    for (const value of exposed) {
      outputLines.push(`${childIndent}- "${value}"`);
    }
  }

  i = cursor - 1;
}

fs.writeFileSync(targetPath, `${outputLines.join("\n")}\n`, "utf8");
console.log(
  `Updated ${TARGET_FILE} from ${SOURCE_FILE} with Coolify-friendly settings.`,
);

function parseContainerPort(rawValue) {
  if (!rawValue) {
    return null;
  }

  let value = stripInlineComment(rawValue.trim());
  if (!value) {
    return null;
  }

  const isQuoted =
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"));

  if (isQuoted) {
    value = value.slice(1, -1);
  }

  let proto = "";
  const slashIndex = value.indexOf("/");
  if (slashIndex !== -1) {
    proto = value.slice(slashIndex + 1);
    value = value.slice(0, slashIndex);
  }

  const colonIndex = value.lastIndexOf(":");
  const containerPort =
    colonIndex === -1 ? value.trim() : value.slice(colonIndex + 1).trim();

  if (!containerPort) {
    return null;
  }

  return proto ? `${containerPort}/${proto}` : containerPort;
}

function dedupe(values) {
  const seen = new Set();
  const result = [];

  for (const value of values) {
    if (seen.has(value)) {
      continue;
    }
    seen.add(value);
    result.push(value);
  }

  return result;
}

function stripInlineComment(value) {
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];

    if (char === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }

    if (char === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }

    if (char === "#" && !inSingle && !inDouble) {
      return value.slice(0, i).trim();
    }
  }

  return value.trim();
}
