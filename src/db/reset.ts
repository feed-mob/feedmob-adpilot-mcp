import { Pool } from 'pg';
import { loadEnvironment } from '../config/environment.js';
import { createDatabasePool } from '../config/database.js';
import { runMigrations } from './migrate.js';

async function resetDatabase(pool: Pool) {
  console.log('Dropping all tables...');
  
  await pool.query('DROP TABLE IF EXISTS creative_assets CASCADE');
  await pool.query('DROP TABLE IF EXISTS campaigns CASCADE');
  await pool.query('DROP TABLE IF EXISTS users CASCADE');
  await pool.query('DROP FUNCTION IF EXISTS update_updated_at_column CASCADE');
  
  console.log('All tables dropped');
  console.log('Running migrations...');
  
  await runMigrations(pool);
  
  console.log('Database reset complete');
}

// Run reset if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const env = loadEnvironment();
  const pool = createDatabasePool(env.DATABASE_URL, env.DATABASE_POOL_SIZE);
  
  resetDatabase(pool)
    .then(() => {
      console.log('Database reset successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database reset failed:', error);
      process.exit(1);
    })
    .finally(() => {
      pool.end();
    });
}
