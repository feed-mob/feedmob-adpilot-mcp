import { Pool } from 'pg';

export const createDatabasePool = (connectionString: string, maxConnections = 20) => {
  return new Pool({
    connectionString,
    max: maxConnections,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
};
