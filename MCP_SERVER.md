# FeedMob AdPilot MCP Server

AI-powered advertising campaign planning and research assistant built with FastMCP and Claude Agent SDK.

## Overview

This MCP server provides intelligent tools for advertising campaign planning:

- **Parse Ad Requirements** - Extract structured campaign parameters from natural language
- **Conduct Ad Research** - Generate comprehensive campaign reports with market insights

## Features

- 🤖 **Agent-Powered NLP** - Uses Claude Agent SDK with custom skills for complex extraction
- 🎨 **Interactive UI** - Rich mcp-ui components for parameter review and editing
- 🔍 **Web Research** - Integrates with search tools for real-time market insights
- ✅ **Type-Safe** - Full TypeScript with Zod schema validation
- 🧪 **Property-Based Testing** - Comprehensive test coverage with fast-check

## Architecture

```
┌─────────────────────────────────────────┐
│  MCP Tools (FastMCP)                    │  ← Tool definitions
│  - parseAdRequirements                  │
│  - conductAdResearch                    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Agent Services                         │  ← Claude Agent SDK
│  - AdRequirementsAgent                  │
│  - AdResearchAgent                      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  UI Factories                           │  ← mcp-ui resources
│  - createParametersUI                   │
│  - createResearchReportUI               │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Schemas (Zod)                          │  ← Type safety
│  - CampaignParameters                   │
│  - CampaignReport                       │
└─────────────────────────────────────────┘
```

## Tools

### parseAdRequirements

Parse natural language campaign requirements into structured parameters.

**Input:**
```typescript
{
  requestText: string  // Natural language campaign description
}
```

**Output:**
- Structured campaign parameters (product, audience, budget, platform, KPIs, etc.)
- List of missing fields
- Suggestions for completing requirements
- Interactive UI for reviewing and editing parameters

**Annotations:**
- `readOnlyHint: true` - Does not modify external state
- `idempotentHint: true` - Same input produces same output

**Example:**
```
"I want to run a TikTok campaign for my eco-friendly water bottles targeting Gen Z 
with a $5000 budget focused on brand awareness"
```

### conductAdResearch

Conduct comprehensive advertising research based on confirmed campaign parameters.

**Input:**
```typescript
{
  campaignParameters: CampaignParameters  // Structured parameters from parsing
}
```

**Output:**
- Executive summary with key findings and recommendations
- Audience insights (demographics, behaviors, preferences)
- Platform-specific strategies and best practices
- Creative direction and format recommendations
- Budget allocation across platforms
- Performance benchmarks and KPIs
- Implementation timeline
- Cited sources

**Annotations:**
- `readOnlyHint: true` - Does not modify external state
- `idempotentHint: false` - Results may vary based on current web data
- `openWorldHint: true` - Uses external web search tools

**Example:**
```typescript
{
  campaignParameters: {
    product_or_service: "Eco-friendly water bottles",
    target_audience: "Gen Z environmentally conscious consumers",
    platform: "TikTok",
    budget: "$5000",
    kpi: "Brand awareness, engagement rate"
    // ... other parameters
  }
}
```

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
# Start development server with watch mode
npm run dev

# Test with MCP Inspector (visual debugging)
npm run mcp:inspect

# Run tests
npm test

# Type checking
npm run typecheck
```

### Production

```bash
# Build
npm run build

# Start production server
npm start
```

## Server Endpoints

- **MCP Endpoint**: `http://localhost:8080/mcp`
- **SSE Endpoint**: `http://localhost:8080/sse`
- **Health Check**: `http://localhost:8080/ready`

## Environment Variables

Create a `.env` file:

```bash
# Optional: Add any API keys for enhanced research capabilities
# ANTHROPIC_API_KEY=your_key_here
```

## Testing

The project includes comprehensive property-based tests:

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Test categories:
- Schema validation round-trips
- Input/output schema enforcement
- Business logic invariants
- UIResource generation
- Visual state consistency

## Claude Agent Skills

The server uses custom Claude Agent skills located in `src/plugins/`:

### parse-ad-requirements

Extracts structured advertising parameters from natural language using NLP techniques.

**Location**: `src/plugins/parse-ad-requirements/skills/parse-ad-requirements/SKILL.md`

### conduct-ad-research

Conducts comprehensive market research using web search tools and generates detailed campaign reports.

**Location**: `src/plugins/conduct-ad-research/skills/conduct-ad-research/SKILL.md`

## Project Structure

```
src/
├── index.ts                    # FastMCP server entry point
├── tools/                      # MCP tool definitions
│   ├── parse-ad-requirements.ts
│   └── conduct-ad-research.ts
├── services/                   # Claude Agent SDK integration
│   ├── ad-requirements-agent.ts
│   └── ad-research-agent.ts
├── utils/                      # UI factories
│   ├── ad-requirements-ui.ts
│   └── ad-research-ui.ts
├── schemas/                    # Zod schemas
│   ├── campaign-params.ts
│   └── ad-research.ts
└── plugins/                    # Claude Agent skills
    ├── parse-ad-requirements/
    └── conduct-ad-research/

tests/
├── unit/                       # Unit tests
└── properties/                 # Property-based tests
```

## Technology Stack

- **FastMCP** (^3.23.1) - MCP server framework
- **@mcp-ui/server** (^5.13.1) - Interactive UI components
- **@anthropic-ai/claude-agent-sdk** (^0.1.54) - Claude Agent integration
- **Zod** (^3.22.0) - Schema validation
- **TypeScript** (^5.3.0) - Type safety
- **Vitest** (^1.2.0) - Testing framework
- **fast-check** (^3.15.0) - Property-based testing

## Best Practices

This server follows MCP best practices:

1. **Clear Tool Naming** - Action-oriented, descriptive names
2. **Type Safety** - Zod schemas for input/output validation
3. **Error Handling** - Categorized errors with actionable messages
4. **Interactive UI** - Rich mcp-ui components for better UX
5. **Annotations** - Proper tool hints for client optimization
6. **Comprehensive Testing** - Property-based tests for invariants
7. **Agent Integration** - Claude Agent SDK for complex NLP tasks

## Documentation

- [Agent Tool Patterns](.kiro/steering/agent-tool-patterns.md) - Architecture patterns
- [FastMCP Integration](.kiro/steering/fastmcp-integration.md) - FastMCP usage
- [MCP-UI Integration](.kiro/steering/mcp-ui-integration.md) - UI component creation
- [Claude Agent Skills](.kiro/steering/claude-agent-skills.md) - Skill development

## License

MIT
