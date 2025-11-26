# FeedMob AdPilot MCP

A conversational advertising assistant built with FastMCP that helps advertisers create comprehensive ad campaigns through natural language interaction.

## Overview

FeedMob AdPilot is an MCP (Model Context Protocol) server that:
- Interprets campaign requirements through natural language
- Generates ad copy and creative materials
- Presents results through interactive UI components
- Integrates with Claude API for natural language processing
- Uses PostgreSQL for data persistence
- Supports Google OAuth authentication

## Features

- **Natural Language Campaign Creation**: Describe your campaign needs in plain English
- **Intelligent Parameter Extraction**: Automatically extracts target audience, budget, platform, and KPIs
- **Ad Copy Generation**: Creates compelling headlines, CTAs, and body text
- **Image Generation**: Generates platform-appropriate creative assets
- **Mixed Media Support**: Combines text and images for complete ad assets
- **Interactive UI**: Rich, editable displays using mcp-ui
- **Campaign History**: Track and retrieve previous campaigns

## Prerequisites

- Node.js 20+
- Docker and Docker Compose (for local database)
- OR PostgreSQL 14+ (if not using Docker)
- [just](https://github.com/casey/just) command runner (optional but recommended)
- Google OAuth credentials
- Anthropic API key

## Quick Start

### Using just (Recommended)

```bash
# Install dependencies
just install

# Setup development environment (starts database + runs migrations)
just setup

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
just dev
```

### Manual Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd feedmob-adpilot-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:

**Option A: Using Docker (Recommended for development)**
```bash
# Start PostgreSQL in Docker
docker-compose up -d

# Wait for database to be ready (check with)
docker-compose ps

# Run migrations
npm run db:migrate
```

**Option B: Using local PostgreSQL**
```bash
# Create the database
createdb feedmob_adpilot

# Run migrations
npm run db:migrate
```

## Configuration

### Environment Variables

See `.env.example` for all required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `ANTHROPIC_API_KEY`: Claude API key
- `IMAGE_SERVICE_URL`: (Optional) Image generation service URL
- `IMAGE_SERVICE_API_KEY`: (Optional) Image generation API key

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:8080/auth/google/callback`
6. Copy client ID and secret to `.env`

## Development Commands

### Using just

```bash
# View all available commands
just

# Database commands
just db-start          # Start PostgreSQL database
just db-stop           # Stop database
just db-clean          # Stop and remove all data
just db-logs           # View database logs
just db-shell          # Access PostgreSQL CLI
just db-migrate        # Run migrations
just db-reset          # Reset database
just db-info           # Show connection info

# Development commands
just dev               # Start development server
just build             # Build for production
just start             # Start production server

# Testing commands
just test              # Run all tests
just test-watch        # Run tests in watch mode
just test-coverage     # Run tests with coverage
just mcp-dev           # Test with FastMCP CLI
just mcp-inspect       # Test with MCP Inspector

# Utility commands
just setup             # Setup dev environment
just start-dev         # Full workflow (setup + dev)
just stop              # Stop everything
just clean-all         # Clean everything
just verify            # Verify setup
just typecheck         # Check TypeScript types
just lint              # Lint code
just format            # Format code
```

### Using npm/docker-compose directly

```bash
# Database management
docker-compose up -d                    # Start database
docker-compose down                     # Stop database
docker-compose down -v                  # Stop and remove data
docker-compose logs -f postgres         # View logs
docker-compose exec postgres psql -U feedmob -d feedmob_adpilot  # CLI

# Development
npm run dev                             # Start dev server
npm run build                           # Build for production
npm start                               # Start production server

# Testing
npm test                                # Run all tests
npm run test:coverage                   # Run with coverage
npm run test:watch                      # Watch mode
npm run mcp:dev                         # FastMCP CLI
npm run mcp:inspect                     # MCP Inspector

# Database migrations
npm run db:migrate                      # Run migrations
npm run db:reset                        # Reset database
```

## Project Structure

```
feedmob-adpilot-mcp/
├── src/
│   ├── index.ts              # FastMCP server entry point
│   ├── config/               # Configuration files
│   ├── services/             # Business logic services
│   ├── tools/                # MCP tool definitions
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   └── db/                   # Database migrations and schema
├── tests/
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   ├── property/             # Property-based tests
│   └── arbitraries/          # fast-check generators
└── README.md
```

## MCP Tools

The server exposes the following MCP tools:

1. **parseCampaignRequest**: Parse natural language into structured campaign parameters
2. **generateAdCopy**: Generate advertising copy for a campaign
3. **generateAdImages**: Generate image creatives for a campaign
4. **generateMixedMedia**: Generate mixed media assets (text + images)
5. **getCampaignHistory**: Retrieve user's campaign history

## Database Schema

### Users Table
- Stores user information from Google OAuth
- Links campaigns to authenticated users

### Campaigns Table
- Stores campaign parameters (target audience, budget, platform, KPIs)
- JSONB fields for flexible data storage

### Creative Assets Table
- Stores generated ad copy, images, and mixed media
- Links to campaigns via foreign key

## Architecture

The system uses:
- **FastMCP**: MCP server framework with built-in authentication
- **@mcp-ui/server**: Interactive UI component generation
- **Claude API**: Natural language processing and content generation
- **PostgreSQL**: Persistent data storage
- **Zod**: Type-safe schema validation

## Contributing

1. Follow the existing code structure
2. Write tests for new features
3. Use TypeScript strict mode
4. Follow the project's ESLint configuration
5. Update documentation as needed

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
