import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const packageJson = {
  type: 'module',
};

async function writePackageJson(targetDir) {
  const packageJsonPath = path.join(targetDir, 'package.json');
  await mkdir(targetDir, { recursive: true });
  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

const sourceBase = path.join(projectRoot, 'prisma', 'generated');

await writePackageJson(sourceBase);
await writePackageJson(path.join(sourceBase, 'prisma'));
