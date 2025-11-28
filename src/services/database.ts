import pg, { type PoolClient } from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Database configuration from environment
 */
interface DatabaseConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

/**
 * DatabaseService - Manages PostgreSQL connection pool and provides database operations
 */
class DatabaseService {
  private pool: pg.Pool | null = null;
  private config: DatabaseConfig;
  private retryAttempts = 5;
  private retryDelayMs = 1000;

  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Load database configuration from environment
   */
  private loadConfig(): DatabaseConfig {
    const connectionString = process.env.DATABASE_URL;
    
    if (connectionString) {
      return {
        connectionString,
        max: parseInt(process.env.DB_POOL_MAX || '10', 10),
        idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
        connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000', 10),
      };
    }

    return {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'feedmob_adpilot',
      user: process.env.DB_USER || 'feedmob',
      password: process.env.DB_PASSWORD || 'feedmob_dev_password',
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000', 10),
    };
  }


  /**
   * Connect to the database with retry logic
   */
  async connect(): Promise<void> {
    if (this.pool) {
      return;
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        this.pool = new Pool(this.config);
        
        // Test the connection
        const client = await this.pool.connect();
        client.release();
        
        console.log('✅ Database connected successfully');
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`Database connection attempt ${attempt}/${this.retryAttempts} failed: ${lastError.message}`);
        
        if (this.pool) {
          await this.pool.end().catch(() => {});
          this.pool = null;
        }

        if (attempt < this.retryAttempts) {
          const delay = this.retryDelayMs * Math.pow(2, attempt - 1); // Exponential backoff
          await this.sleep(delay);
        }
      }
    }

    throw new Error(`Failed to connect to database after ${this.retryAttempts} attempts: ${lastError?.message}`);
  }

  /**
   * Disconnect from the database
   */
  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('✅ Database disconnected');
    }
  }

  /**
   * Check if connected to the database
   */
  isConnected(): boolean {
    return this.pool !== null;
  }

  /**
   * Health check - verify database connectivity
   */
  async healthCheck(): Promise<boolean> {
    if (!this.pool) {
      return false;
    }

    try {
      const result = await this.pool.query('SELECT 1 as health');
      return result.rows.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Execute a query and return all rows
   */
  async query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]> {
    if (!this.pool) {
      throw new Error('Database not connected. Call connect() first.');
    }

    try {
      const result = await this.pool.query(sql, params);
      return result.rows as T[];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Database query failed: ${message}`);
    }
  }

  /**
   * Execute a query and return a single row or null
   */
  async queryOne<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Execute a transaction with automatic commit/rollback
   */
  async transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    if (!this.pool) {
      throw new Error('Database not connected. Call connect() first.');
    }

    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }


  /**
   * Run database migrations
   */
  async runMigrations(): Promise<void> {
    if (!this.pool) {
      throw new Error('Database not connected. Call connect() first.');
    }

    // Create migrations tracking table if it doesn't exist
    await this.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Get list of applied migrations
    const applied = await this.query<{ name: string }>('SELECT name FROM migrations ORDER BY id');
    const appliedNames = new Set(applied.map(m => m.name));

    // Get migration files
    const migrationsDir = join(__dirname, '..', 'migrations');
    let migrationFiles: string[] = [];
    
    try {
      migrationFiles = readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();
    } catch {
      console.log('No migrations directory found, skipping migrations');
      return;
    }

    // Run pending migrations
    for (const file of migrationFiles) {
      if (appliedNames.has(file)) {
        continue;
      }

      console.log(`Running migration: ${file}`);
      const sql = readFileSync(join(migrationsDir, file), 'utf-8');

      await this.transaction(async (client) => {
        await client.query(sql);
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
      });

      console.log(`✅ Migration applied: ${file}`);
    }
  }

  /**
   * Sleep helper for retry logic
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const db = new DatabaseService();
