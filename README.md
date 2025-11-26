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
- PostgreSQL 14+
- Google OAuth credentials
- Anthropic API key

## Installation

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

## Development

### Running the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm run build
npm start
```

### Testing with FastMCP CLI

```bash
# Interactive testing
npm run mcp:dev

# Visual debugging with MCP Inspector
npm run mcp:inspect
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
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
