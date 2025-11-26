import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadEnvironment } from '../config/environment.js';
import { createDatabasePool } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(pool: Pool) {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = await fs.readdir(migrationsDir);
  const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

  console.log(`Found ${sqlFiles.length} migration files`);

  for (const file of sqlFiles) {
    console.log(`Running migration: ${file}`);
    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf-8');
    await pool.query(sql);
    console.log(`Completed migration: ${file}`);
  }
}

// Run migrations if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const env = loadEnvironment();
  const pool = createDatabasePool(env.DATABASE_URL, env.DATABASE_POOL_SIZE);
  
  runMigrations(pool)
    .then(() => {
      console.log('All migrations completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    })
    .finally(() => {
      pool.end();
    });
}
