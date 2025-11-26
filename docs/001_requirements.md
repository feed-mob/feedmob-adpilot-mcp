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

### 2. Generate Ad Copy

- Produce high-quality advertising text (headlines, CTAs, body text).
- Present results through `mcp-ui` interactive components.

------

### 3. Generate Ad Images

- Generate image creatives for the campaign.
- Display generated visuals using `mcp-ui`.

------

### 4. Generate Mixed Media Creatives (Image + Copy)

- If supported, produce ad assets combining text and images.
- Display using `mcp-ui` composite components.

------

## Summary

This MCP system functions as a fully-integrated **conversational ad-generation assistant**, capable of:

- Understanding and structuring campaign requirements
- Creating ad copy
- Generating image assets
- Displaying results through rich MCP-UI elements

Built on the MCP ecosystem, it leverages `claude-agent-sdk`, `mcp-ui`, `scira-mcp-ui-chat`, TypeScript, and PostgreSQL.