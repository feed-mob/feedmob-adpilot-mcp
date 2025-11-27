# Design Document: Conduct Ad Research

## Overview

The Conduct Ad Research feature extends the FeedMob AdPilot MCP system with comprehensive advertising research capabilities. After campaign requirements are parsed and confirmed, this feature conducts thorough market research using web search tools and generates a structured campaign report with actionable insights.

The feature follows the established agent-tool pattern in the codebase:
- **MCP Tool** (`conductAdResearch`) - Entry point for FastMCP, handles validation and orchestration
- **Agent Service** (`AdResearchAgent`) - Claude Agent SDK integration, plugin management, response parsing
- **Skill Plugin** (`conduct-ad-research`) - Instructions for the agent to perform research, including web search tool usage (DuckDuckGo/Tavily MCP), query patterns, and result synthesis
- **UI Factory** (`ad-research-ui.ts`) - Generates interactive UIResources for displaying results
- **Schemas** (`ad-research.ts`) - Zod schemas for type safety and validation

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MCP Client (Chat UI)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  FastMCP Server (src/index.ts)                               │
│  - conductAdResearch tool                                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  Tool Layer (src/tools/conduct-ad-research.ts)               │
│  - Input validation (Zod)                                    │
│  - Error categorization                                      │
│  - Response formatting                                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  Agent Service (src/services/ad-research-agent.ts)           │
│  - Claude Agent SDK integration                              │
│  - Plugin management                                         │
│  - Response parsing and validation                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          │                                 │
          ▼                                 ▼
┌─────────────────────────────────┐ ┌─────────────────┐
│  Skill Plugin                   │ │  UI Factory     │
│  (conduct-ad-research)          │ │  (ad-research-  │
│  - Research workflow            │ │   ui.ts)        │
│  - Web Search Tool Integration  │ │                 │
│    (DuckDuckGo/Tavily MCP)      │ │                 │
│  - Query patterns & synthesis   │ │                 │
└─────────────────────────────────┘ └─────────────────┘
```

## Components and Interfaces

### 1. MCP Tool: `conductAdResearch`

**Location**: `src/tools/conduct-ad-research.ts`

**Interface**:
```typescript
{
  name: 'conductAdResearch',
  description: 'Conduct comprehensive advertising research based on confirmed campaign parameters',
  parameters: ConductAdResearchInputSchema,
  execute: async (args) => Promise<MCPToolResponse>
}
```

**Responsibilities**:
- Validate input campaign parameters
- Call AdResearchAgent service
- Generate text summary for LLM
- Generate UIResource for user display
- Handle and categorize errors

### 2. Agent Service: `AdResearchAgent`

**Location**: `src/services/ad-research-agent.ts`

**Interface**:
```typescript
class AdResearchAgent {
  conductResearch(params: CampaignParameters): Promise<CampaignReport>
}
```

**Responsibilities**:
- Resolve plugin path for conduct-ad-research skill
- Construct research prompt with campaign parameters
- Execute Claude Agent SDK with web search tool access
- Parse and validate JSON response
- Handle agent errors and timeouts

### 3. Skill Plugin: `conduct-ad-research`

**Location**: `src/plugins/conduct-ad-research/`

**Structure**:
```
src/plugins/conduct-ad-research/
├── .mcp.json                          # MCP server config for web search tools
└── skills/
    └── conduct-ad-research/
        └── SKILL.md                   # Skill instructions
```

**MCP Configuration** (`.mcp.json`):
```json
{
  "mcpServers": {
    "duckduckgo": {
      "command": "uvx",
      "args": ["duckduckgo-mcp-server"],
      "env": {},
      "disabled": false
    },
    "tavily": {
      "command": "uvx",
      "args": ["tavily-mcp-server"],
      "env": {
        "TAVILY_API_KEY": "${TAVILY_API_KEY}"
      },
      "disabled": true
    }
  }
}
```

**Plugin Manifest** (referenced in `src/plugins/.claude-plugin/marketplace.json`):
```json
{
  "name": "conduct-ad-research",
  "source": "./conduct-ad-research",
  "description": "Conduct comprehensive advertising research using web search",
  "version": "1.0.0",
  "author": {
    "name": "FeedMob",
    "email": "dev@feedmob.com"
  },
  "skills": [
    "./skills/conduct-ad-research/SKILL.md"
  ],
  "mcpServers": "./.mcp.json"
}
```

**Responsibilities**:
- Define research workflow and methodology
- Integrate web search tool usage (DuckDuckGo or Tavily MCP)
- Specify search query patterns for each research category
- Specify output format (CampaignReport JSON)
- Provide examples of research queries and outputs
- Include copyright compliance guidelines
- Handle search failures gracefully with fallback strategies

**Web Search Integration**:
The skill plugin instructs the agent to use available MCP search tools:
- Query construction patterns for audience, platform, competitor, and benchmark research
- Result synthesis and citation extraction
- Fallback behavior when search results are limited

### 4. UI Factory: `createResearchReportUI`

**Location**: `src/utils/ad-research-ui.ts`

**Interface**:
```typescript
function createResearchReportUI(report: CampaignReport): UIResource
function createResearchErrorUI(error: Error, errorType: ErrorType): UIResource
```

**Responsibilities**:
- Generate collapsible sections for each report section
- Render visual data representations (tables, charts)
- Highlight key takeaways and recommendations
- Include source citations with links
- Add action buttons for proceeding to ad copy generation
- Include copyright disclaimer

### 5. Schemas

**Location**: `src/schemas/ad-research.ts`

**Schemas**:
- `ConductAdResearchInputSchema` - Tool input validation
- `ResearchSourceSchema` - Source citation structure
- `CampaignReportSectionSchema` - Individual section structure
- `CampaignReportSchema` - Complete report structure

## Data Models

### CampaignReport

```typescript
interface CampaignReport {
  // Metadata
  generated_at: string;  // ISO timestamp
  campaign_name: string | null;
  
  // Report Sections
  executive_summary: {
    overview: string;
    key_findings: string[];
    recommendations: string[];
  };
  
  audience_insights: {
    demographics: string;
    behaviors: string;
    preferences: string;
    engagement_patterns: string;
  };
  
  platform_strategy: {
    platform: string;
    trends: string;
    best_practices: string;
    optimization_tips: string;
  }[];
  
  creative_direction: {
    content_types: string[];
    format_recommendations: string;
    tone_and_style: string;
    examples: string[];
  };
  
  budget_allocation: {
    total_budget: string | null;
    distribution: {
      platform: string;
      percentage: number;
      rationale: string;
    }[];
    optimization_suggestions: string;
  };
  
  performance_metrics: {
    primary_kpis: string[];
    benchmarks: {
      metric: string;
      industry_average: string;
      target: string;
    }[];
    tracking_recommendations: string;
  };
  
  implementation_timeline: {
    phase: string;
    duration: string;
    activities: string[];
  }[];
  
  // Sources and Compliance
  sources: {
    title: string;
    url: string;
    accessed_at: string;
  }[];
  
  assumptions: string[];  // Notes about missing parameters
  
  disclaimer: string;  // Copyright compliance notice
}
```

### ConductAdResearchInput

```typescript
interface ConductAdResearchInput {
  campaignParameters: CampaignParameters;  // From campaign-params.ts
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, the following correctness properties have been identified:

### Property 1: Campaign Report Completeness

*For any* valid CampaignReport, all required sections (executive_summary, audience_insights, platform_strategy, creative_direction, budget_allocation, performance_metrics, implementation_timeline) must be present and contain non-empty content.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

### Property 2: UIResource Structural Integrity

*For any* valid CampaignReport, the generated UIResource HTML must contain all required structural elements: collapsible section containers, highlighted key takeaways, source citation elements with anchor tags, and action buttons with onclick handlers.

**Validates: Requirements 3.1, 3.3, 3.4, 3.5**

### Property 3: Source Attribution Validity

*For any* CampaignReport with sources, each source must have a non-empty title and a valid URL format.

**Validates: Requirements 4.2**

### Property 4: Copyright Disclaimer Presence

*For any* UIResource generated from a CampaignReport, the HTML must contain a copyright compliance disclaimer section.

**Validates: Requirements 4.4**

### Property 5: Graceful Missing Parameter Handling

*For any* CampaignParameters with one or more null fields, the generated CampaignReport must be valid (pass schema validation) and contain an assumptions array noting the missing information.

**Validates: Requirements 5.1, 5.2**

### Property 6: Error UI Structure

*For any* error passed to createResearchErrorUI, the generated UIResource must contain an error message, error type indicator, and retry button with onclick handler.

**Validates: Requirements 6.3**

### Property 7: Schema Validation

*For any* object returned by AdResearchAgent.conductResearch, it must pass validation against CampaignReportSchema without errors.

**Validates: Requirements 6.4**

### Property 8: Round-Trip Consistency

*For any* valid CampaignReport, serializing to JSON and deserializing back must produce an equivalent object.

**Validates: Requirements 6.5**

## Error Handling

### Error Categories

| Error Type | Cause | User Message | Recovery |
|------------|-------|--------------|----------|
| `validation` | Invalid input parameters | "Invalid campaign parameters" | Show validation errors |
| `agent` | Claude Agent SDK failure | "Research processing failed" | Retry button |
| `search` | Web search tool failure | "Unable to gather research data" | Retry with note |
| `timeout` | Request exceeded time limit | "Research took too long" | Retry button |
| `unknown` | Unexpected error | "An unexpected error occurred" | Retry button |

### Error Flow

```
Error Occurs
    │
    ▼
Categorize Error Type
    │
    ▼
Log Error Details (console.error)
    │
    ▼
Generate Error UIResource
    │
    ▼
Return Error Response to Client
```

## Testing Strategy

### Dual Testing Approach

This feature uses both unit tests and property-based tests for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and integration points
- **Property-based tests**: Verify universal properties that should hold across all inputs

### Property-Based Testing Framework

**Library**: fast-check (already in project dependencies)

**Configuration**: Each property test runs a minimum of 100 iterations.

**Test File Location**: `tests/properties/ad-research.property.test.ts`

### Property Test Annotations

Each property-based test must be annotated with:
```typescript
// **Feature: conduct-ad-research, Property {number}: {property_text}**
```

### Test Categories

1. **Schema Validation Tests**
   - CampaignReportSchema accepts valid reports
   - CampaignReportSchema rejects invalid reports
   - Round-trip JSON serialization

2. **UI Generation Tests**
   - UIResource contains required structural elements
   - Collapsible sections render correctly
   - Source citations include links
   - Action buttons have handlers
   - Copyright disclaimer present

3. **Error Handling Tests**
   - Error UI renders for each error type
   - Retry buttons present and functional

4. **Missing Parameter Tests**
   - Reports generated with partial parameters
   - Assumptions array populated correctly

### Unit Test Categories

**Test File Location**: `tests/unit/ad-research.test.ts`

1. **Input Validation**
   - Valid campaign parameters accepted
   - Empty parameters rejected
   - Malformed parameters rejected

2. **Agent Service**
   - Plugin path resolution
   - Response parsing
   - Error handling

3. **UI Factory**
   - Section rendering
   - Visual elements
   - Interactive elements

## Web Search Integration (Skill Plugin)

The web search capabilities are integrated within the skill plugin. The SKILL.md file instructs the agent on how to use available MCP search tools.

### Supported Search Tools

The skill plugin can leverage any of the following MCP-integrated search tools:

1. **DuckDuckGo** - Privacy-focused web search (recommended default)
2. **Tavily** - AI-optimized search API

### Search Query Patterns (Defined in SKILL.md)

| Category | Query Pattern | Purpose |
|----------|---------------|---------|
| Audience | "{geography} {target_audience} demographics behavior trends" | Understand target market |
| Platform | "{platform} advertising trends 2024 best practices" | Platform-specific insights |
| Competitor | "{product_category} competitor advertising strategies" | Competitive landscape |
| Benchmarks | "{industry} {kpi} benchmarks average rates" | Performance targets |
| Creative | "{ad_format} {platform} successful ad examples" | Creative inspiration |

### Search Workflow (Skill Plugin Instructions)

1. **Query Construction**: Build search queries from campaign parameters
2. **Tool Invocation**: Use available MCP search tool (DuckDuckGo or Tavily)
3. **Result Extraction**: Parse relevant information from search results
4. **Synthesis**: Combine findings into structured report sections
5. **Citation**: Include source URLs and titles for attribution
6. **Fallback**: If search fails, note limitation and provide general insights

### MCP Tool Configuration

The agent service allows the following tools for the skill:
```typescript
allowedTools: ['Skill', 'Read', 'WebSearch', 'mcp__duckduckgo__search', 'mcp__tavily__search']
```
