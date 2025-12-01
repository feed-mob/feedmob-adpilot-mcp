# FeedMob AdPilot MCP Server

AI-powered advertising campaign planning and creative generation system built with FastMCP, Claude Agent SDK, and mcp-ui.

## Features

### 🎯 Parse Advertising Requirements
Extract structured campaign parameters from natural language descriptions.

### 🔍 Conduct Ad Research
Generate comprehensive campaign reports with market insights, audience analysis, and platform strategies.

### ✍️ Generate Ad Copy
Create two distinct ad copy variations optimized for your target platform and audience.

### 🖼️ Generate Ad Images
Generate image variations for campaigns with interactive selection.

### 🎨 Generate Mixed Media
Combine selected images with ad copy for complete creative assets.

### 📊 Campaign Management
Store and retrieve campaign data with PostgreSQL persistence.

## Quick Start

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)
- AWS Account with Bedrock access (for Claude Agent SDK)

### Installation

```bash
npm install
```

### Configuration

```bash
cp .env.example .env
```

Configure your `.env` file with:
- AWS credentials for Bedrock
- PostgreSQL connection (or use Docker)
- Optional: Tavily API key for enhanced research

### Start Database

```bash
docker-compose up -d postgres
```

### Run Development Server

```bash
npm run dev
```

Server starts at `http://localhost:8080/mcp`

### Test with MCP Inspector

```bash
npm run mcp:inspect
```

## Available Tools

| Tool | Description |
|------|-------------|
| `parseAdRequirements` | Parse natural language campaign requirements |
| `conductAdResearch` | Generate comprehensive campaign research reports |
| `generateAdCopy` | Create ad copy variations |
| `generateAdImages` | Generate image variations |
| `generateMixedMediaCreative` | Combine images and copy |
| `getCampaign` | Retrieve stored campaign data |

## Project Structure

```
├── src/
│   ├── index.ts              # FastMCP server entry
│   ├── tools/                # MCP tool definitions
│   ├── services/             # Agent services (Claude SDK)
│   ├── utils/                # UI factories (mcp-ui)
│   ├── schemas/              # Zod validation schemas
│   └── plugins/              # Claude Agent skills
├── client-ui/                # Next.js chat interface
├── tests/                    # Unit and property tests
├── docs/                     # Documentation
└── .kiro/specs/              # Feature specifications
```

## Endpoints

- **MCP**: `http://localhost:8080/mcp`
- **SSE**: `http://localhost:8080/sse`
- **Health**: `http://localhost:8080/health`

## Development

```bash
npm run dev          # Start with hot reload
npm run build        # Build for production
npm start            # Run production build
npm test             # Run tests
npm run typecheck    # Type checking
npm run mcp:inspect  # Visual debugging
```

## Docker Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for Coolify/Docker deployment instructions.

Pre-built images available at:
- `ghcr.io/feedmob/feedmob_adpilot_mcp:latest`
- `ghcr.io/feedmob/feedmob_adpilot_mcp-ui:latest`

## Technology Stack

- **FastMCP** - MCP server framework
- **@mcp-ui/server** - Interactive UI components
- **@anthropic-ai/claude-agent-sdk** - Claude Agent integration
- **Zod** - Runtime type validation
- **PostgreSQL** - Campaign data persistence
- **Vitest + fast-check** - Testing

## Client UI

The `client-ui/` directory contains a Next.js chat interface that connects to this MCP server. See [client-ui/README.md](client-ui/README.md) for details.

## License

MIT
