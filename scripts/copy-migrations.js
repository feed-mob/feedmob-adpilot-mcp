import { cpSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const srcMigrations = join(projectRoot, 'src', 'migrations');
const distDir = join(projectRoot, 'dist');
const distMigrations = join(distDir, 'migrations');

if (!existsSync(srcMigrations)) {
  console.warn('No migrations directory found in src; skipping copy');
  process.exit(0);
}

mkdirSync(distDir, { recursive: true });

cpSync(srcMigrations, distMigrations, { recursive: true, force: true });

console.log(`Copied migrations to ${distMigrations}`);
