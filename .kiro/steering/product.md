# Product Overview

FeedMob AdPilot is a conversational advertising assistant built as an MCP (Model Context Protocol) server. It enables advertisers to create comprehensive ad campaigns through natural language interaction.

## Core Capabilities

- **Natural Language Campaign Creation**: Users describe campaign needs in plain English
- **Intelligent Parameter Extraction**: Automatically extracts target audience, budget, platform, and KPIs from natural language
- **Ad Copy Generation**: Creates compelling headlines, CTAs, and body text using Claude API
- **Image Generation**: Generates platform-appropriate creative assets
- **Mixed Media Support**: Combines text and images for complete ad assets
- **Interactive UI**: Rich, editable displays using mcp-ui for parameter review and asset selection
- **Campaign History**: Tracks and retrieves previous campaigns per user

## Key Technologies

- **FastMCP**: MCP server framework with built-in authentication and HTTP streaming
- **@mcp-ui/server**: Interactive UI component generation within MCP responses
- **Claude API**: Natural language processing and content generation
- **PostgreSQL**: Persistent data storage for users, campaigns, and creative assets
- **Google OAuth**: User authentication

## MCP Tools

The server exposes five main tools:
1. `parseCampaignRequest` - Parse natural language into structured campaign parameters
2. `generateAdCopy` - Generate advertising copy for a campaign
3. `generateAdImages` - Generate image creatives for a campaign
4. `generateMixedMedia` - Generate mixed media assets (text + images)
5. `getCampaignHistory` - Retrieve user's campaign history

## Target Users

Advertisers and marketing professionals who want to streamline campaign creation through conversational AI interfaces.
