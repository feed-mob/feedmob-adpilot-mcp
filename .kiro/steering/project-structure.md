---
inclusion: always
---

# Project Structure and Database Guidelines

## Project Structure

```
feedmob-adpilot-mcp/
├── src/
│   ├── index.ts                 # FastMCP server entry point
│   ├── config/
│   │   ├── environment.ts       # Environment configuration
│   │   └── database.ts          # Database configuration
│   ├── services/
│   │   ├── auth.service.ts      # Google OAuth authentication
│   │   ├── claude.service.ts    # Claude API integration
│   │   ├── database.service.ts  # Database operations
│   │   ├── image.service.ts     # Image generation service
│   │   └── ui.service.ts        # UIResource generation
│   ├── tools/
│   │   ├── parseCampaignRequest.ts
│   │   ├── generateAdCopy.ts
│   │   ├── generateAdImages.ts
│   │   ├── generateMixedMedia.ts
│   │   └── getCampaignHistory.ts
│   ├── types/
│   │   ├── campaign.ts          # Campaign-related types
│   │   ├── user.ts              # User types
│   │   └── mcp.ts               # MCP-specific types
│   ├── utils/
│   │   ├── validation.ts        # Validation utilities
│   │   └── formatting.ts        # Formatting utilities
│   └── db/
│       ├── migrations/          # Database migrations
│       │   ├── 001_create_users.sql
│       │   ├── 002_create_campaigns.sql
│       │   └── 003_create_creative_assets.sql
│       └── schema.sql           # Complete schema
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   ├── tools/
│   │   └── utils/
│   ├── integration/
│   │   ├── database.test.ts
│   │   └── api.test.ts
│   ├── property/
│   │   └── campaign.property.test.ts
│   └── arbitraries/
│       └── campaign.ts          # fast-check arbitraries
├── .env.example                 # Environment variables template
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## TypeScript Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "types": ["node", "vitest/globals"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

## Database Guidelines

### PostgreSQL Setup

#### Connection Configuration

```typescript
// src/config/database.ts
import { Pool } from 'pg';

export const createDatabasePool = () => {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
};
```

#### Environment Variables

```bash
# .env.example
DATABASE_URL=postgresql://user:password@localhost:5432/feedmob_adpilot
DATABASE_POOL_SIZE=20
```

### Database Schema

#### Users Table

```sql
-- migrations/001_create_users.sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  picture TEXT,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

#### Campaigns Table

```sql
-- migrations/002_create_campaigns.sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  target_audience JSONB NOT NULL,
  budget JSONB NOT NULL,
  platform JSONB NOT NULL,
  kpis TEXT[] NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_campaigns_user ON campaigns(user_id);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

-- Add GIN index for JSONB queries
CREATE INDEX idx_campaigns_target_audience ON campaigns USING GIN (target_audience);
CREATE INDEX idx_campaigns_platform ON campaigns USING GIN (platform);

CREATE TRIGGER update_campaigns_updated_at 
  BEFORE UPDATE ON campaigns 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

#### Creative Assets Table

```sql
-- migrations/003_create_creative_assets.sql
CREATE TABLE creative_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('copy', 'image', 'mixed_media')),
  asset_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_assets_campaign ON creative_assets(campaign_id);
CREATE INDEX idx_assets_type ON creative_assets(asset_type);
CREATE INDEX idx_assets_created_at ON creative_assets(created_at DESC);

-- Add GIN index for JSONB queries
CREATE INDEX idx_assets_data ON creative_assets USING GIN (asset_data);
```

### Database Service Implementation

```typescript
// src/services/database.service.ts
import { Pool } from 'pg';
import { User, CampaignParameters, CreativeAsset, Campaign } from '../types';

export class DatabaseService {
  constructor(private pool: Pool) {}

  // User operations
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const result = await this.pool.query(
      `INSERT INTO users (email, name, picture, google_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      [user.email, user.name, user.picture, user.googleId]
    );
    return result.rows[0].id;
  }

  async getUser(userId: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  async getUserByGoogleId(googleId: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE google_id = $1',
      [googleId]
    );
    return result.rows[0] || null;
  }

  // Campaign operations
  async saveCampaign(
    userId: string, 
    params: Omit<CampaignParameters, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const result = await this.pool.query(
      `INSERT INTO campaigns (user_id, target_audience, budget, platform, kpis) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id`,
      [
        userId,
        JSON.stringify(params.targetAudience),
        JSON.stringify(params.budget),
        JSON.stringify(params.platform),
        params.kpis
      ]
    );
    return result.rows[0].id;
  }

  async getCampaign(campaignId: string): Promise<Campaign | null> {
    const result = await this.pool.query(
      'SELECT * FROM campaigns WHERE id = $1',
      [campaignId]
    );
    
    if (!result.rows[0]) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      targetAudience: row.target_audience,
      budget: row.budget,
      platform: row.platform,
      kpis: row.kpis,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async getCampaignHistory(userId: string, limit = 50): Promise<Campaign[]> {
    const result = await this.pool.query(
      `SELECT * FROM campaigns 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    
    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      targetAudience: row.target_audience,
      budget: row.budget,
      platform: row.platform,
      kpis: row.kpis,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  // Creative asset operations
  async saveCreativeAsset(
    campaignId: string,
    assetType: 'copy' | 'image' | 'mixed_media',
    assetData: any
  ): Promise<string> {
    const result = await this.pool.query(
      `INSERT INTO creative_assets (campaign_id, asset_type, asset_data) 
       VALUES ($1, $2, $3) 
       RETURNING id`,
      [campaignId, assetType, JSON.stringify(assetData)]
    );
    return result.rows[0].id;
  }

  async getCreativeAssets(campaignId: string): Promise<CreativeAsset[]> {
    const result = await this.pool.query(
      `SELECT * FROM creative_assets 
       WHERE campaign_id = $1 
       ORDER BY created_at DESC`,
      [campaignId]
    );
    
    return result.rows.map(row => ({
      id: row.id,
      campaignId: row.campaign_id,
      assetType: row.asset_type,
      assetData: row.asset_data,
      createdAt: row.created_at
    }));
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Cleanup
  async close(): Promise<void> {
    await this.pool.end();
  }
}
```

### Migration Management

#### Running Migrations

```typescript
// src/db/migrate.ts
import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';

export async function runMigrations(pool: Pool) {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = await fs.readdir(migrationsDir);
  const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

  for (const file of sqlFiles) {
    console.log(`Running migration: ${file}`);
    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf-8');
    await pool.query(sql);
    console.log(`Completed migration: ${file}`);
  }
}
```

#### Migration Script

```bash
# package.json scripts
{
  "scripts": {
    "db:migrate": "tsx src/db/migrate.ts",
    "db:reset": "tsx src/db/reset.ts"
  }
}
```

## Environment Configuration

### Environment Variables

```typescript
// src/config/environment.ts
import { z } from 'zod';

const envSchema = z.object({
  // Server
  PORT: z.string().default('8080'),
  HOST: z.string().default('localhost'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database
  DATABASE_URL: z.string(),
  DATABASE_POOL_SIZE: z.string().transform(Number).default('20'),
  
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string(),
  
  // Claude API
  ANTHROPIC_API_KEY: z.string(),
  CLAUDE_MODEL: z.string().default('claude-3-5-sonnet-20241022'),
  
  // Image Generation (optional)
  IMAGE_SERVICE_URL: z.string().optional(),
  IMAGE_SERVICE_API_KEY: z.string().optional(),
});

export type Environment = z.infer<typeof envSchema>;

export function loadEnvironment(): Environment {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('Environment validation failed:');
    console.error(parsed.error.format());
    process.exit(1);
  }
  
  return parsed.data;
}
```

### .env.example

```bash
# Server Configuration
PORT=8080
HOST=localhost
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/feedmob_adpilot
DATABASE_POOL_SIZE=20

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8080/auth/google/callback

# Claude API Configuration
ANTHROPIC_API_KEY=sk-ant-your-api-key
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# Image Generation Service (Optional)
IMAGE_SERVICE_URL=https://api.openai.com/v1/images/generations
IMAGE_SERVICE_API_KEY=sk-your-openai-key
```

## Package.json Scripts

```json
{
  "name": "feedmob-adpilot-mcp",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "db:migrate": "tsx src/db/migrate.ts",
    "db:reset": "tsx src/db/reset.ts",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\"",
    "mcp:dev": "npx fastmcp dev src/index.ts",
    "mcp:inspect": "npx fastmcp inspect src/index.ts"
  },
  "dependencies": {
    "fastmcp": "^latest",
    "@mcp-ui/server": "^latest",
    "@anthropic-ai/sdk": "^latest",
    "pg": "^8.11.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/pg": "^8.11.0",
    "typescript": "^5.3.0",
    "tsx": "^4.7.0",
    "vitest": "^1.2.0",
    "@vitest/coverage-v8": "^1.2.0",
    "fast-check": "^3.15.0",
    "eslint": "^8.56.0",
    "prettier": "^3.2.0"
  }
}
```

## Best Practices

### 1. Type Safety

Always define types for your data models:

```typescript
// src/types/campaign.ts
export interface CampaignParameters {
  id?: string;
  userId: string;
  targetAudience: {
    demographics: string[];
    ageRange?: [number, number];
    location?: string[];
  };
  budget: {
    amount: number;
    currency: string;
  };
  platform: {
    name: string;
    format: string;
  };
  kpis: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
```

### 2. Error Handling

Use custom error classes:

```typescript
// src/utils/errors.ts
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}
```

### 3. Logging

Use structured logging:

```typescript
// src/utils/logger.ts
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({ level: 'info', message, ...meta, timestamp: new Date() }));
  },
  error: (message: string, error?: Error, meta?: any) => {
    console.error(JSON.stringify({ 
      level: 'error', 
      message, 
      error: error?.message, 
      stack: error?.stack,
      ...meta, 
      timestamp: new Date() 
    }));
  }
};
```

### 4. Database Transactions

Use transactions for multi-step operations:

```typescript
async saveCampaignWithAssets(
  userId: string,
  params: CampaignParameters,
  assets: CreativeAsset[]
): Promise<string> {
  const client = await this.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const campaignId = await this.saveCampaign(userId, params);
    
    for (const asset of assets) {
      await this.saveCreativeAsset(campaignId, asset.type, asset.data);
    }
    
    await client.query('COMMIT');
    return campaignId;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

### 5. Connection Pooling

Always use connection pooling and handle cleanup:

```typescript
// Graceful shutdown
process.on('SIGTERM', async () => {
  await db.close();
  process.exit(0);
});
```

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [node-postgres (pg)](https://node-postgres.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)
