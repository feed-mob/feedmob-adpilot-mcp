# Project Structure

## Directory Layout

```
feedmob-adpilot-mcp/
├── src/                          # Source code
│   ├── index.ts                  # FastMCP server entry point & initialization
│   ├── config/                   # Configuration modules
│   │   ├── environment.ts        # Environment variable validation (Zod)
│   │   └── database.ts           # Database connection pool setup
│   ├── services/                 # Business logic layer
│   │   ├── auth.service.ts       # Google OAuth authentication
│   │   ├── claude.service.ts     # Claude API integration
│   │   ├── database.service.ts   # Database operations (CRUD)
│   │   ├── image.service.ts      # Image generation service
│   │   └── ui.service.ts         # UIResource generation (mcp-ui)
│   ├── tools/                    # MCP tool definitions
│   │   ├── parseCampaignRequest.ts
│   │   ├── generateAdCopy.ts
│   │   ├── generateAdImages.ts
│   │   ├── generateMixedMedia.ts
│   │   └── getCampaignHistory.ts
│   ├── types/                    # TypeScript type definitions
│   │   ├── campaign.ts           # Campaign-related interfaces
│   │   ├── user.ts               # User & auth types
│   │   └── mcp.ts                # MCP-specific types
│   ├── utils/                    # Utility functions
│   │   ├── errors.ts             # Custom error classes
│   │   ├── formatting.ts         # Data formatting utilities
│   │   ├── logger.ts             # Structured JSON logging
│   │   └── validation.ts         # Validation helpers
│   └── db/                       # Database layer
│       ├── migrations/           # SQL migration files
│       │   ├── 001_create_users.sql
│       │   ├── 002_create_campaigns.sql
│       │   └── 003_create_creative_assets.sql
│       ├── schema.sql            # Complete database schema
│       ├── migrate.ts            # Migration runner
│       └── reset.ts              # Database reset utility
├── tests/                        # Test files
│   ├── unit/                     # Unit tests (services, utils, tools)
│   ├── integration/              # Integration tests (database, API)
│   ├── property/                 # Property-based tests (fast-check)
│   └── arbitraries/              # fast-check generators
│       └── campaign.ts           # Campaign data generators
├── .kiro/                        # Kiro IDE configuration
│   └── steering/                 # AI assistant guidance documents
├── dist/                         # Compiled JavaScript (generated)
├── coverage/                     # Test coverage reports (generated)
├── node_modules/                 # Dependencies (generated)
├── .env                          # Environment variables (not in git)
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── docker-compose.yaml           # PostgreSQL container setup
├── justfile                      # Development command shortcuts
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── vitest.config.ts              # Test configuration
├── README.md                     # Project documentation
├── QUICK_START.md                # Quick start guide
└── verify-setup.sh               # Setup verification script
```

## Architecture Patterns

### Layered Architecture

1. **Entry Point** (`src/index.ts`)
   - Initializes FastMCP server
   - Sets up authentication
   - Registers tools
   - Handles graceful shutdown

2. **Configuration Layer** (`src/config/`)
   - Environment validation with Zod
   - Database connection pooling
   - Centralized configuration management

3. **Service Layer** (`src/services/`)
   - Business logic encapsulation
   - External API integrations (Claude, Image generation)
   - Database operations
   - UI resource generation

4. **Tool Layer** (`src/tools/`)
   - MCP tool definitions
   - Zod schema validation for parameters
   - Orchestrates services to fulfill tool requests
   - Returns UIResources or text content

5. **Data Layer** (`src/db/`)
   - SQL migrations for schema management
   - Database utilities (migrate, reset)

### Key Conventions

#### File Naming
- Services: `*.service.ts`
- Types: `*.ts` in `types/` directory
- Tests: `*.test.ts` (co-located or in `tests/`)
- Migrations: `NNN_description.sql` (numbered sequentially)

#### Import Patterns
- Use `.js` extensions in imports (ESM requirement)
- Import from `types/` for shared interfaces
- Services are instantiated in `index.ts` and passed to tools

#### Type Definitions
- Interfaces for data models in `src/types/`
- Zod schemas for runtime validation (tool parameters, environment)
- Separate types for database entities vs. API responses

#### Error Handling
- Custom error classes in `src/utils/errors.ts`
- Throw descriptive errors in tools (returned to MCP client)
- Use Response objects for HTTP-level errors in authentication

#### Logging
- Structured JSON logging via `src/utils/logger.ts`
- Log levels: info, error, warn, debug
- Include timestamps and metadata

### Database Schema

#### Tables
1. **users** - Google OAuth user information
2. **campaigns** - Campaign parameters (JSONB for flexible data)
3. **creative_assets** - Generated ad copy, images, mixed media

#### Relationships
- campaigns.user_id → users.id (CASCADE DELETE)
- creative_assets.campaign_id → campaigns.id (CASCADE DELETE)

#### Indexes
- Primary keys on all tables
- Foreign key indexes for joins
- GIN indexes on JSONB columns for queries
- Timestamp indexes for sorting

### Testing Structure

#### Unit Tests (`tests/unit/`)
- Test individual functions and classes
- Mock external dependencies (database, APIs)
- Focus on business logic

#### Integration Tests (`tests/integration/`)
- Test database operations with real PostgreSQL
- Test API integrations (may use mocks)
- Test tool execution end-to-end

#### Property Tests (`tests/property/`)
- Use fast-check for generative testing
- Test invariants and properties
- Use custom arbitraries from `tests/arbitraries/`

### Tool Implementation Pattern

Each tool follows this structure:
```typescript
import { z } from 'zod';

const ToolParamsSchema = z.object({
  // parameter definitions
});

server.addTool({
  name: "toolName",
  description: "Clear description for LLM",
  parameters: ToolParamsSchema,
  execute: async (args, context) => {
    // 1. Extract user from context
    // 2. Validate/process arguments
    // 3. Call services
    // 4. Generate UIResource or text response
    // 5. Return content array
  }
});
```

### Service Implementation Pattern

Services are classes with dependency injection:
```typescript
export class ServiceName {
  constructor(private dependency: DependencyType) {}
  
  async method(params: ParamsType): Promise<ReturnType> {
    // Implementation
  }
}
```

### UIResource Pattern

UI resources use mcp-ui for interactive displays:
```typescript
import { createUIResource } from '@mcp-ui/server';

const uiResource = createUIResource({
  uri: 'ui://resource-type/id',
  content: { type: 'rawHtml', htmlString: html },
  encoding: 'text',
  metadata: {
    title: 'Display Title',
    description: 'Description'
  }
});
```

## Development Workflow

1. Start database: `just db-start`
2. Run migrations: `just db-migrate`
3. Start dev server: `just dev`
4. Test with MCP Inspector: `just mcp-inspect`
5. Run tests: `just test`
6. Check types: `just typecheck`
