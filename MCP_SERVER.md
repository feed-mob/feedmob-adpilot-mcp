# FeedMob AdPilot MCP Server

AI-powered advertising campaign planning and creative generation built with FastMCP and Claude Agent SDK.

## Overview

This MCP server provides a complete advertising workflow:

1. **Parse Ad Requirements** - Extract structured parameters from natural language
2. **Conduct Ad Research** - Generate comprehensive campaign reports
3. **Generate Ad Copy** - Create platform-optimized copy variations
4. **Generate Ad Images** - Create image variations for campaigns
5. **Generate Mixed Media** - Combine images and copy for final creatives
6. **Campaign Management** - Store and retrieve campaign data

## Architecture

```
┌─────────────────────────────────────────┐
│  MCP Tools (FastMCP)                    │
│  - parseAdRequirements                  │
│  - conductAdResearch                    │
│  - generateAdCopy                       │
│  - generateAdImages                     │
│  - generateMixedMediaCreative           │
│  - getCampaign                          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Agent Services (Claude Agent SDK)      │
│  - AdRequirementsAgent                  │
│  - AdResearchAgent                      │
│  - AdCopyAgent                          │
│  - AdImagesAgent                        │
│  - MixedMediaAgent                      │
│  - CampaignManagementAgent              │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  UI Factories (mcp-ui)                  │
│  - createParametersUI                   │
│  - createResearchReportUI               │
│  - createAdCopyUI                       │
│  - createAdImagesUI                     │
│  - createMixedMediaUI                   │
│  - createCampaignUI                     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Data Layer                             │
│  - Zod Schemas (validation)             │
│  - PostgreSQL (persistence)             │
└─────────────────────────────────────────┘
```

## Tools

### parseAdRequirements

Parse natural language campaign requirements into structured parameters.

**Input:**
```typescript
{ requestText: string }
```

**Output:**
- Structured campaign parameters (product, audience, budget, platform, KPIs, etc.)
- List of missing fields
- Interactive UI for reviewing and editing

### conductAdResearch

Conduct comprehensive advertising research based on campaign parameters.

**Input:**
```typescript
{ campaignParameters: CampaignParameters }
```

**Output:**
- Executive summary with key findings
- Audience insights and platform strategies
- Creative direction recommendations
- Budget allocation suggestions
- Performance benchmarks
- Implementation timeline
- Cited sources

### generateAdCopy

Generate two distinct ad copy variations.

**Input:**
```typescript
{
  campaignParameters: CampaignParameters,
  campaignReport?: CampaignReport  // Optional research insights
}
```

**Output:**
- Two copy variations with headline, body, CTA
- Platform-optimized content
- Recommendation for best variation
- Interactive selection UI

### generateAdImages

Generate image variations for campaigns.

**Input:**
```typescript
{
  campaignParameters: CampaignParameters,
  selectedCopy?: AdCopyVariation
}
```

**Output:**
- Multiple image variations
- Interactive preview and selection

### generateMixedMediaCreative

Combine selected image and copy into final creative.

**Input:**
```typescript
{
  campaignParameters: CampaignParameters,
  selectedImage: ImageVariation,
  selectedCopy: AdCopyVariation
}
```

**Output:**
- Combined creative asset
- Platform-specific formatting
- Export options

### getCampaign

Retrieve stored campaign data.

**Input:**
```typescript
{ campaignId: string }
```

**Output:**
- Complete campaign data
- Associated creatives and research

## Server Endpoints

- **MCP**: `http://localhost:8080/mcp`
- **SSE**: `http://localhost:8080/sse`
- **Health**: `http://localhost:8080/health`

## Claude Agent Skills

Skills are located in `src/plugins/`:

| Skill | Location |
|-------|----------|
| parse-ad-requirements | `src/plugins/parse-ad-requirements/skills/` |
| conduct-ad-research | `src/plugins/conduct-ad-research/skills/` |
| generate-ad-copy | `src/plugins/generate-ad-copy/skills/` |
| generate-ad-images | `src/plugins/generate-ad-images/skills/` |
| generate-mixed-media | `src/plugins/generate-mixed-media/skills/` |
| manage-campaign | `src/plugins/manage-campaign/skills/` |

## Project Structure

```
src/
├── index.ts                    # FastMCP server entry
├── tools/                      # MCP tool definitions
│   ├── parse-ad-requirements.ts
│   ├── conduct-ad-research.ts
│   ├── generate-ad-copy.ts
│   ├── generate-ad-images.ts
│   ├── generate-mixed-media.ts
│   └── get-campaign.ts
├── services/                   # Claude Agent SDK integration
│   ├── ad-requirements-agent.ts
│   ├── ad-research-agent.ts
│   ├── ad-copy-agent.ts
│   ├── ad-images-agent.ts
│   ├── mixed-media-agent.ts
│   ├── campaign-management-agent.ts
│   ├── campaign.ts
│   └── database.ts
├── utils/                      # UI factories
│   ├── ad-requirements-ui.ts
│   ├── ad-research-ui.ts
│   ├── ad-copy-ui.ts
│   ├── ad-images-ui.ts
│   ├── mixed-media-ui.ts
│   └── campaign-ui.ts
├── schemas/                    # Zod schemas
│   ├── campaign-params.ts
│   ├── ad-research.ts
│   ├── ad-copy.ts
│   ├── ad-images.ts
│   ├── mixed-media.ts
│   ├── campaign.ts
│   └── health.ts
└── plugins/                    # Claude Agent skills
```

## Quick Start

```bash
# Install
npm install

# Configure
cp .env.example .env

# Start database
docker-compose up -d postgres

# Run development server
npm run dev

# Test with MCP Inspector
npm run mcp:inspect
```

## Technology Stack

- **FastMCP** (^3.23.1) - MCP server framework
- **@mcp-ui/server** (^5.13.1) - Interactive UI components
- **@anthropic-ai/claude-agent-sdk** (^0.1.54) - Claude Agent integration
- **Zod** (^3.22.0) - Schema validation
- **PostgreSQL** - Data persistence
- **TypeScript** (^5.3.0) - Type safety
- **Vitest** (^1.2.0) - Testing
- **fast-check** (^3.15.0) - Property-based testing

## License

MIT
