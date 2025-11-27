# Quick Start Guide

## Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```env
# Add any required API keys here
```

### 3. Start the Server

```bash
npm run dev
```

You should see:
```
✅ Registered tools: greet, button, counter, parseAdRequirements
🚀 FeedMob AdPilot MCP Server started
📍 MCP endpoint: http://localhost:8080/mcp
```

## Test the Tool

### Option 1: MCP Inspector (Recommended)

```bash
npm run mcp:inspect
```

This opens a visual interface where you can:
1. Select the `parseAdRequirements` tool
2. Enter a campaign description
3. See the interactive UI response

### Option 2: Command Line

```bash
# In another terminal
curl -X POST http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "parseAdRequirements",
      "arguments": {
        "requestText": "Create a TikTok video ad for my fitness app targeting Southeast Asian women aged 25-35 with a $5,000 budget."
      }
    },
    "id": 1
  }'
```

## Example Inputs

### Complete Campaign
```
"Launch a Facebook carousel ad campaign for our organic coffee brand targeting coffee enthusiasts aged 30-50 in the United States. Budget is $10,000 for Q1 2024. Goal is to drive website traffic and increase brand awareness. Creative should be warm and inviting with earth tones."
```

### Minimal Campaign (will show missing fields)
```
"I need ads for my new mobile game"
```

### Specific Platform Campaign
```
"Instagram story ads for our fashion boutique, targeting women 18-35 in New York City, $3000 budget, launching next month"
```

## Expected Output

The tool returns an interactive mcp-ui component showing:

- ✅ **Extracted Parameters**: All 12 campaign fields in card layout
- 🟠 **Missing Fields**: Highlighted in orange with "Not specified"
- ✓ **Confirmation Button**: Appears when all fields are complete
- 🎨 **Responsive Design**: Adapts to light/dark mode

## Troubleshooting

### "Failed to load skill instructions"

Make sure the `skills/parse-ad-requirements.md` file exists:
```bash
ls skills/parse-ad-requirements.md
```

### TypeScript Errors

Run typecheck:
```bash
npm run typecheck
```

### Tests Failing

Run tests with verbose output:
```bash
npm test -- --reporter=verbose
```

## Next Steps

1. **Integrate with your MCP client** (Claude Desktop, etc.)
2. **Customize the skill** (`skills/parse-ad-requirements.md`)
3. **Add more tools** (ad copy generation, image generation)
4. **Store results** (add database integration)

## Development Commands

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run typecheck

# Visual debugging
npm run mcp:inspect
```

## Architecture Overview

```
User Input (Natural Language)
    ↓
parseAdRequirements Tool
    ↓
AdRequirementsAgent (Claude Agent SDK)
    ↓
parse-ad-requirements Skill
    ↓
ValidationResult (Zod Schema)
    ↓
createParametersUI (mcp-ui)
    ↓
Interactive UI Component
```

## Support

- Check the [README.md](README.md) for detailed documentation
- Review [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for technical details
- See `.kiro/specs/parse-ad-requirements/` for the complete specification

## Tips

1. **Be specific**: More details in the input = fewer missing fields
2. **Use natural language**: The tool understands conversational descriptions
3. **Iterate**: Start simple, then add details based on missing field prompts
4. **Test variations**: Try different platforms, budgets, and audiences

Happy building! 🚀
