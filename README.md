# FeedMob AdPilot MCP Server

A Model Context Protocol (MCP) server that provides AI-powered advertising campaign tools using FastMCP and mcp-ui.

## Features

### Parse Advertising Requirements

The `parseAdRequirements` tool extracts structured campaign parameters from natural language descriptions using the Claude Agent SDK.

**Example input:**
```
"Create a TikTok video ad for my fitness app targeting Southeast Asian women aged 25-35 with a $5,000 budget."
```

**Extracted parameters:**
- Product/Service
- Target Audience
- Geography
- Ad Format
- Budget
- Platform
- KPIs
- Time Period
- Creative Direction
- And more...

The tool displays results in an interactive mcp-ui interface with visual distinction for missing fields.

## Setup

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

#### Option 1: Anthropic API (Default)

```env
# Add any required API keys here
```

Get your API key from [Anthropic Console](https://console.anthropic.com/).

#### Option 2: AWS Bedrock

```env
CLAUDE_CODE_USE_BEDROCK=1
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
ANTHROPIC_MODEL=us.anthropic.claude-sonnet-4-20250514-v1:0
```

## Development

### Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:8080/mcp` (binds to `0.0.0.0` so you can reach it from containers or remote hosts). To bind to a different interface, set `FASTMCP_HOST`, e.g. `FASTMCP_HOST=127.0.0.1 npm run dev`.

### Test with MCP Inspector

```bash
npm run mcp:inspect
```

This opens a visual debugging interface where you can test tools interactively.

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Type Checking

```bash
npm run typecheck
```

## Project Structure

```
.
├── src/
│   ├── index.ts                    # FastMCP server entry point
│   ├── schemas/
│   │   └── campaign-params.ts      # Zod schemas for validation
│   ├── services/
│   │   └── ad-requirements-agent.ts # Claude Agent SDK integration
│   ├── tools/
│   │   ├── parse-ad-requirements.ts # Parse campaign requirements
│   │   ├── conduct-ad-research.ts   # Research competitors & trends
│   │   ├── generate-ad-copy.ts      # Generate ad copy variations
│   │   ├── generate-ad-images.ts    # Generate ad images
│   │   └── generate-mixed-media.ts  # Generate mixed media creatives
│   └── utils/
│       ├── ad-requirements-ui.ts   # Campaign parameters UI
│       ├── ad-research-ui.ts       # Research results UI
│       ├── ad-copy-ui.ts           # Ad copy UI
│       ├── ad-images-ui.ts         # Ad images UI
│       └── mixed-media-ui.ts       # Mixed media UI
├── skills/
│   └── parse-ad-requirements.md    # Agent skill instructions
├── tests/
│   ├── unit/                       # Unit tests
│   └── properties/                 # Property-based tests
└── .kiro/specs/                    # Feature specifications
    └── parse-ad-requirements/
        ├── requirements.md
        ├── design.md
        └── tasks.md
```

## Available Tools

### parseAdRequirements

Parse natural language advertising campaign requirements into structured parameters.

**Parameters:**
- `requestText` (string, required): Natural language campaign description

**Returns:**
- Interactive mcp-ui component displaying extracted parameters
- Visual indicators for missing fields
- Confirmation button when all fields are complete

## MCP Endpoints

- **MCP Endpoint**: `http://localhost:8080/mcp`
- **SSE Endpoint**: `http://localhost:8080/sse`
- **Health Check**: `http://localhost:8080/ready`

## Technology Stack

- **FastMCP** (^3.23.1) - MCP server framework
- **@mcp-ui/server** (^5.13.1) - Interactive UI components
- **@anthropic-ai/claude-agent-sdk** (^0.1.54) - Claude Agent integration
- **Zod** (^3.22.0) - Runtime type validation
- **TypeScript** (^5.3.0) - Type-safe development
- **Vitest** (^1.2.0) - Testing framework
- **fast-check** (^3.15.0) - Property-based testing

## Testing

The project includes comprehensive test coverage:

- **Unit Tests**: Test individual components and functions
- **Property-Based Tests**: Verify correctness properties across generated inputs
  - Schema round-trip validation
  - Input validation enforcement
  - UIResource structure compliance
  - Visual distinction for missing fields
  - Confirmation button presence logic

All tests run with 100+ iterations to ensure robustness.

## License

MIT
