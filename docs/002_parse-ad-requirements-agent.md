# Parse Ad Requirements Agent

## Overview

This service uses the Claude Agent SDK to parse natural language advertising campaign requirements into structured parameters.

## Architecture

The service uses a **hybrid approach**:

1. **Plugin Mode** (preferred): Attempts to load the `parse-ad-requirements` plugin with full skill definitions
2. **Embedded Mode** (fallback): Uses embedded instructions directly in the prompt if plugin is unavailable

## Plugin Structure

```
plugins/parse-ad-requirements/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
└── skills/
    └── parse-ad-requirements/
        └── SKILL.md          # Skill definition with instructions
```

## Configuration

### Environment Variables Setup

The project uses `dotenv` to load environment variables from a `.env` file:

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` if needed for any API keys.

3. The `.env` file is automatically loaded when the server starts

### Plugin Path Resolution

The agent tries these paths in order:

1. `PARSE_AD_REQUIREMENTS_PLUGIN_PATH` environment variable (if set)
2. `<project-root>/plugins/parse-ad-requirements`
3. `<cwd>/plugins/parse-ad-requirements`

### Claude Agent SDK Authentication

The Claude Agent SDK requires authentication to work properly. You have two options:

#### Authentication

The Claude Agent SDK handles authentication automatically.

#### Option 2: Claude Code CLI Login

Run the Claude Code CLI login:

```bash
npx @anthropic-ai/claude-code login
```

This will authenticate the CLI and SDK will use those credentials.

#### Option 3: AWS Bedrock (Enterprise)

For enterprise deployments using AWS Bedrock:

```bash
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export ANTHROPIC_MODEL=us.anthropic.claude-sonnet-4-20250514-v1:0
```

## Current Status

**Status**: The service currently runs in **Embedded Mode** because:

1. Plugin system requires Claude Agent SDK authentication (API key or login)
2. Plugin loading has issues even with correct structure and authentication
3. Embedded mode provides identical functionality without external dependencies

## Usage

```typescript
import { adRequirementsAgent } from './services/ad-requirements-agent';

const result = await adRequirementsAgent.parseRequirements(
  'Create a TikTok video ad for my fitness app targeting women aged 25-35 in Southeast Asia'
);

console.log(result);
// {
//   success: false,
//   parameters: { product_or_service: 'fitness app', ... },
//   missingFields: ['product_or_service_url', 'budget', ...],
//   suggestions: { ... }
// }
```

## Troubleshooting

### "Invalid API key" Error

**Cause**: Claude Agent SDK cannot authenticate

**Solution**: Run `npx @anthropic-ai/claude-code login`

### "Plugin not found" Warning

**Cause**: Plugin directory doesn't exist or isn't properly structured

**Solution**: This is expected and harmless - the agent falls back to embedded mode

### "Claude Code process exited with code 1"

**Cause**: Usually an authentication issue or plugin loading failure

**Solution**: Check authentication is configured correctly. If issues persist, the embedded mode fallback will handle the request.

## Future Improvements

Once Claude Agent SDK authentication is properly configured:

1. Plugin mode will automatically activate
2. Skills can be updated independently of code
3. Multiple skills can be added to the same plugin
4. Better separation of concerns between code and instructions

## References

- [Claude Agent SDK Documentation](https://docs.anthropic.com/claude/docs/agent-sdk)
- [Example n8n Node with Plugin](../../../vendor/claude-code-marketplace/plugins/direct-spend-visualizer)
- [Plugin Structure Reference](https://docs.anthropic.com/claude/docs/plugins-reference)
