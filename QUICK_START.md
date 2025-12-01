# Quick Start Guide

Get the FeedMob AdPilot MCP Server running in 5 minutes.

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# AWS Bedrock (required for Claude Agent SDK)
CLAUDE_CODE_USE_BEDROCK=1
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
ANTHROPIC_MODEL=us.anthropic.claude-sonnet-4-20250514-v1:0

# PostgreSQL
DATABASE_URL=postgresql://feedmob:feedmob@localhost:5432/feedmob_adpilot

# Optional: Enhanced research
TAVILY_API_KEY=your_tavily_key
```

## 3. Start Database

```bash
docker-compose up -d postgres
```

## 4. Start the Server

```bash
npm run dev
```

You should see:
```
✅ Database connected
✅ Database migrations complete
✅ Registered tools: parseAdRequirements, conductAdResearch, generateAdCopy, generateAdImages, generateMixedMediaCreative, getCampaign
🚀 FeedMob AdPilot MCP Server started on http://0.0.0.0:8080/mcp
✅ Health check endpoint available at http://0.0.0.0:8080/health
```

## 5. Test with MCP Inspector

```bash
npm run mcp:inspect
```

This opens a visual interface to test tools interactively.

## Example: Parse Campaign Requirements

1. Select `parseAdRequirements` tool
2. Enter:
```json
{
  "requestText": "Create a TikTok video ad for my fitness app targeting Southeast Asian women aged 25-35 with a $5,000 budget."
}
```
3. View the interactive UI showing extracted parameters

## Example: Full Workflow

```
1. parseAdRequirements → Extract campaign parameters
2. conductAdResearch → Generate research report
3. generateAdCopy → Create ad copy variations
4. generateAdImages → Generate image options
5. generateMixedMediaCreative → Combine for final creative
```

## Troubleshooting

### Database Connection Failed
```bash
# Ensure PostgreSQL is running
docker-compose ps
docker-compose up -d postgres
```

### AWS Bedrock Errors
- Verify AWS credentials in `.env`
- Ensure Bedrock access is enabled in your AWS account
- Check the model ID is correct for your region

### Tests Failing
```bash
npm test -- --reporter=verbose
```

## Development Commands

```bash
npm run dev          # Development with hot reload
npm run build        # Build for production
npm start            # Run production build
npm test             # Run all tests
npm run typecheck    # TypeScript checking
npm run mcp:inspect  # Visual MCP debugging
```

## Next Steps

- See [README.md](README.md) for full documentation
- See [DEPLOYMENT.md](DEPLOYMENT.md) for Docker/Coolify deployment
- See [client-ui/README.md](client-ui/README.md) for the chat interface
