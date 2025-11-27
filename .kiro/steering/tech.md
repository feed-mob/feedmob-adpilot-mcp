# Technology Stack

## Core Technologies

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.3+ with strict mode enabled
- **Module System**: ESM (ES Modules)
- **Package Manager**: npm

## Key Dependencies

### MCP & UI
- **fastmcp** (^3.23.1) - MCP server framework with HTTP streaming transport
- **@mcp-ui/server** (^5.13.1) - Interactive UI component generation

### AI & APIs
- **@anthropic-ai/sdk** (^0.71.0) - Claude API integration for NLP and content generation

### Database
- **pg** (^8.11.0) - PostgreSQL client with connection pooling
- **PostgreSQL 14+** - Primary data store (via Docker or local installation)

### Validation & Type Safety
- **zod** (^3.22.0) - Runtime type validation and schema definition

## Development Tools

- **tsx** (^4.7.0) - TypeScript execution and watch mode
- **vitest** (^1.2.0) - Testing framework
- **@vitest/coverage-v8** - Code coverage reporting
- **fast-check** (^3.15.0) - Property-based testing
- **eslint** (^8.56.0) - Code linting
- **prettier** (^3.2.0) - Code formatting

## Build Configuration

### TypeScript (tsconfig.json)
- Target: ES2022
- Module: ESNext
- Module Resolution: bundler
- Strict mode enabled
- Source maps and declarations generated
- Output: `./dist`

### Testing (vitest.config.ts)
- Environment: node
- Globals enabled
- Coverage provider: v8
- Coverage formats: text, json, html

## Common Commands

### Development
```bash
npm run dev              # Start dev server with watch mode
npm run build            # Compile TypeScript to dist/
npm start                # Run production build
```

### Database
```bash
npm run db:start         # Start PostgreSQL via Docker
npm run db:stop          # Stop database
npm run db:migrate       # Run migrations
npm run db:reset         # Reset database
```

### Testing
```bash
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run with coverage report
```

### MCP Development
```bash
npm run mcp:dev          # Test with FastMCP CLI
npm run mcp:inspect      # Visual debugging with MCP Inspector
```

### Code Quality
```bash
npm run typecheck        # Check TypeScript types
npm run lint             # Lint code
npm run format           # Format code with Prettier
```

## Just Command Runner

The project includes a `justfile` for streamlined development workflows:

```bash
just                     # List all commands
just setup               # Setup dev environment (db + migrations)
just dev                 # Start development server
just test                # Run tests
just mcp-inspect         # Visual MCP debugging
just db-shell            # Access PostgreSQL CLI
just clean-all           # Clean everything
```

## Docker Setup

PostgreSQL runs in Docker via `docker-compose.yaml`:
- Image: postgres:16-alpine
- Port: 5432
- Database: feedmob_adpilot
- User: feedmob
- Persistent volume for data

## Environment Variables

Required configuration in `.env`:
- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_CLIENT_ID` - OAuth client ID
- `GOOGLE_CLIENT_SECRET` - OAuth secret
- `GOOGLE_CALLBACK_URL` - OAuth redirect URI
- `IMAGE_SERVICE_URL` (optional) - Image generation service
- `IMAGE_SERVICE_API_KEY` (optional) - Image service key

Environment validation is enforced via Zod schemas in `src/config/environment.ts`.

## Server Architecture

- **Transport**: HTTP streaming with SSE support
- **Port**: 8080 (configurable)
- **Endpoints**:
  - `/mcp` - Main MCP endpoint
  - `/sse` - Server-sent events
  - `/ready` - Health check
- **Authentication**: Google OAuth via FastMCP's authenticate hook
- **CORS**: Enabled by default
