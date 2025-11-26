---
inclusion: always
---

# FastMCP Integration Guidelines

## Overview

This project uses **FastMCP** as the MCP server framework. FastMCP is a TypeScript framework built on top of the official MCP SDK that provides opinionated, production-ready features for building MCP servers.

## Why FastMCP?

FastMCP eliminates boilerplate and provides:
- Built-in HTTP streaming transport with SSE compatibility
- Authentication and session management
- Type-safe tool definitions with Zod schemas
- Error handling and retry logic
- Progress notifications and streaming output
- Health check endpoints
- CORS support (enabled by default)

## Server Setup

### Basic Server Configuration

```typescript
import { FastMCP } from 'fastmcp';
import { z } from 'zod';

const server = new FastMCP({
  name: "FeedMob AdPilot",
  version: "1.0.0",
  authenticate: async (request) => {
    // Google OAuth authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = await validateGoogleToken(token);
    return {
      userId: user.id,
      email: user.email,
      name: user.name
    };
  }
});
```

### Starting the Server

```typescript
server.start({
  transportType: "httpStream",
  httpStream: {
    port: 8080,
    endpoint: "/mcp" // Optional, defaults to /mcp
  }
});
```

This automatically starts:
- HTTP streaming server on `http://localhost:8080/mcp`
- SSE server on `http://localhost:8080/sse`
- Health check endpoint on `http://localhost:8080/ready`

## Tool Definition

### Type-Safe Tools with Zod

Always use Zod schemas for tool parameters to ensure type safety:

```typescript
const CampaignRequestSchema = z.object({
  requestText: z.string().describe("Natural language campaign request"),
  userId: z.string().uuid().optional().describe("User ID (optional, from auth)")
});

server.addTool({
  name: "parseCampaignRequest",
  description: "Parse natural language campaign request into structured parameters",
  parameters: CampaignRequestSchema,
  execute: async (args, context) => {
    // context.user contains authenticated user info
    const { userId, email } = context.user;
    
    // Tool implementation
    const params = await extractParameters(args.requestText);
    const uiResource = createParameterDisplay(params);
    
    return {
      content: [uiResource]
    };
  }
});
```

### Tools Without Parameters

For tools that don't need parameters:

```typescript
server.addTool({
  name: "getCampaignHistory",
  description: "Get user's campaign history",
  // No parameters property needed
  execute: async (args, context) => {
    const campaigns = await db.getCampaignHistory(context.user.userId);
    return createHistoryDisplay(campaigns);
  }
});
```

## Authentication

### Google OAuth Integration

FastMCP's `authenticate` function is called for every request:

```typescript
authenticate: async (request) => {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    throw new Response('Unauthorized', { status: 401 });
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  try {
    const user = await authService.validateToken(token);
    return {
      userId: user.id,
      email: user.email,
      name: user.name
    };
  } catch (error) {
    throw new Response('Invalid token', { status: 401 });
  }
}
```

### Accessing User Context in Tools

The authenticated user is available in the tool execution context:

```typescript
execute: async (args, context) => {
  const { userId, email, name } = context.user;
  // Use user info in tool logic
}
```

## Error Handling

### Tool-Level Errors

Throw descriptive errors that will be returned to the client:

```typescript
execute: async (args, context) => {
  if (!args.requestText) {
    throw new Error('Campaign request text is required');
  }
  
  try {
    const result = await processRequest(args.requestText);
    return result;
  } catch (error) {
    throw new Error(`Failed to process request: ${error.message}`);
  }
}
```

### Authentication Errors

Throw Response objects for HTTP-level errors:

```typescript
authenticate: async (request) => {
  if (!isValidToken(token)) {
    throw new Response('Invalid authentication token', { 
      status: 401,
      headers: { 'WWW-Authenticate': 'Bearer' }
    });
  }
}
```

## Testing

### CLI Testing

Use FastMCP's built-in CLI for development:

```bash
# Test with MCP CLI
npx fastmcp dev src/index.ts

# Test with MCP Inspector (visual debugging)
npx fastmcp inspect src/index.ts
```

### Integration Testing

Test tools with authenticated context:

```typescript
import { describe, it, expect } from 'vitest';

describe('parseCampaignRequest tool', () => {
  it('should extract campaign parameters', async () => {
    const mockContext = {
      user: { userId: 'test-user', email: 'test@example.com', name: 'Test User' },
      sessionId: 'test-session'
    };
    
    const result = await parseCampaignRequestTool.execute(
      { requestText: 'I want to run a TikTok campaign with $5000 budget' },
      mockContext
    );
    
    expect(result.content[0].type).toBe('resource');
  });
});
```

## Best Practices

1. **Always use Zod schemas** for tool parameters - provides type safety and automatic validation
2. **Use descriptive tool names** - they appear in the MCP client UI
3. **Add detailed descriptions** - helps LLMs understand when to use each tool
4. **Handle errors gracefully** - return user-friendly error messages
5. **Use the authenticated user context** - don't require userId as a parameter
6. **Return UIResources** - leverage mcp-ui for rich interactive displays
7. **Test with FastMCP CLI** - use `npx fastmcp dev` during development
8. **Enable health checks** - monitor server status with `/ready` endpoint

## Common Patterns

### Returning Multiple Content Items

```typescript
execute: async (args, context) => {
  return {
    content: [
      { type: 'text', text: 'Campaign created successfully!' },
      createParameterDisplay(params),
      createCopyDisplay(copy)
    ]
  };
}
```

### Progress Notifications

```typescript
execute: async (args, context) => {
  await context.sendProgress('Extracting parameters...');
  const params = await extractParameters(args.requestText);
  
  await context.sendProgress('Validating budget...');
  await validateBudget(params);
  
  return createParameterDisplay(params);
}
```

### Streaming Output

```typescript
execute: async (args, context) => {
  const stream = generateCopyStream(args.params);
  
  for await (const chunk of stream) {
    await context.sendStreamChunk(chunk);
  }
  
  return { content: [{ type: 'text', text: 'Copy generation complete' }] };
}
```

## Resources

- [FastMCP GitHub](https://github.com/punkpeye/fastmcp)
- [FastMCP Documentation](https://github.com/punkpeye/fastmcp#readme)
- [MCP Specification](https://modelcontextprotocol.io/)
- [Zod Documentation](https://zod.dev/)
