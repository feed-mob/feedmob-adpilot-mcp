 # FeedMob AdPilot MCP Requirements

## Overview

Create an **FeedMob AdPilot MCP (Model Context Protocol) system** that integrates conversational UI, multiple sub-agents, and ad-creation capabilities. The system allows advertisers to input campaign needs and receive structured interpretations, ad copy, and creative materials through an interactive MCP-UI chatbot interface.

------

## Core Technologies

### Development MCP Tools 

- GitMCP: Provide the IDE with up-to-date `mcp-ui` documentation.
- `context7`
- `sequential-thinking`
- `exa` MCP

 ### UI

- `mcp-ui`: Display interactive UI components in conversational MCP clients.

### Agent Invocation

- `claude-agent-sdk` for calling sub-agents (DeepResearch, custom logic).

### Chat UI

- `scira-mcp-ui-chat` for rendering the chatbot interface.

### Language & Database

- **TypeScript**
- **PostgreSQL**

### MCP Inspector

- `ui-inspector` for inspecting local MCP-UI-enabled servers.

------

## Features

### 1. Parse Advertising Requirements

Advertisers provide text or voice input describing their ad campaign.
 Example:

> "Create a TikTok video ad for my fitness app targeting Southeast Asian women aged 25–35 with a $5,000 budget."

The AI should:

- Use `claude-agent-sdk` to interpret the request.
- Extract parameters:
  - Target audience
  - Budget
  - Advertising platform
  - KPIs (CTR, installs, conversions, etc.)
- Display parsed results using `mcp-ui`.

------

### 2. Conduct Ad Research

After parsing campaign requirements, the system performs comprehensive research to support ad strategy:

- **Target Audience Analysis**
  - Demographics, psychographics, and behavioral patterns
  - Platform-specific user preferences and engagement trends
  - Competitor audience insights

- **Platform Research**
  - Current advertising trends on the target platform (TikTok, Facebook, Instagram, etc.)
  - Best-performing ad formats and content types
  - Platform-specific guidelines and optimization tips

- **Market & Industry Insights**
  - Industry benchmarks (CTR, CPC, conversion rates)
  - Seasonal trends and timing recommendations
  - Emerging content themes and creative approaches

- **Competitive Analysis**
  - Competitor ad strategies and messaging
  - Successful campaign examples in the same niche
  - Differentiation opportunities

The research agent should:
- Use `exa` MCP for web search and content discovery
- Leverage `claude-agent-sdk` with DeepResearch capabilities
- Aggregate findings into actionable insights
- Display research results through `mcp-ui` interactive components with:
  - Collapsible sections for different research areas
  - Visual data representations (charts, comparisons)
  - Key takeaways and recommendations
  - Source citations and links

------

### 3. Generate Ad Copy

- Produce high-quality advertising text (headlines, CTAs, body text).
- Informed by research insights from the previous step.
- Present results through `mcp-ui` interactive components.

------

### 4. Generate Ad Images

- Generate **two image variations** for the campaign based on research insights and campaign parameters.
- Present both options to the user through `mcp-ui` interactive components.
- Allow user to:
  - Preview both image variations side-by-side
  - Select their preferred image
  - Request regeneration if neither option is suitable
- Display generated visuals using `mcp-ui` with interactive selection controls.

------

### 5. Generate Mixed Media Creatives (Image + Copy)

- After user selects their preferred image from step 4, use a **separate tool** to combine:
  - The selected image
  - The generated ad copy from step 3
  - Platform-specific formatting and layout
- Display the final composite ad creative through `mcp-ui` with:
  - Preview of the complete ad as it would appear on the target platform
  - Download/export options
  - Option to regenerate with different copy or image variations
- Support multiple ad formats (feed posts, stories, video thumbnails, etc.) based on platform requirements.

------

## Summary

This MCP system functions as a fully-integrated **conversational ad-generation assistant**, capable of:

- Understanding and structuring campaign requirements
- Creating ad copy
- Generating image assets
- Displaying results through rich MCP-UI elements

Built on the MCP ecosystem, it leverages `claude-agent-sdk`, `mcp-ui`, `scira-mcp-ui-chat`, TypeScript, and PostgreSQL.