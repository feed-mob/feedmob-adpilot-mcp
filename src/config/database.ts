import { z } from 'zod';

/**
 * Database configuration schema with validation
 */
export const DatabaseConfigSchema = z.object({
  // Connection string (takes precedence if provided)
  connectionString: z.string().url().optional(),
  
  // Individual connection settings
  host: z.string().default('localhost'),
  port: z.coerce.number().int().positive().default(5432),
  database: z.string().default('feedmob_adpilot'),
  user: z.string().default('feedmob'),
  password: z.string().default('feedmob_dev_password'),
  
  // Pool settings
  poolMax: z.coerce.number().int().positive().default(10),
  idleTimeoutMs: z.coerce.number().int().nonnegative().default(30000),
  connectionTimeoutMs: z.coerce.number().int().positive().default(5000),
});

export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;

/**
 * Load and validate database configuration from environment
 */
export function loadDatabaseConfig(): DatabaseConfig {
  const config = DatabaseConfigSchema.parse({
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    poolMax: process.env.DB_POOL_MAX,
    idleTimeoutMs: process.env.DB_IDLE_TIMEOUT,
    connectionTimeoutMs: process.env.DB_CONNECTION_TIMEOUT,
  });

  return config;
}

/**
 * Get PostgreSQL connection options from config
 */
export function getPoolConfig(config: DatabaseConfig) {
  if (config.connectionString) {
    return {
      connectionString: config.connectionString,
      max: config.poolMax,
      idleTimeoutMillis: config.idleTimeoutMs,
      connectionTimeoutMillis: config.connectionTimeoutMs,
    };
  }

  return {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    max: config.poolMax,
    idleTimeoutMillis: config.idleTimeoutMs,
    connectionTimeoutMillis: config.connectionTimeoutMs,
  };
}
