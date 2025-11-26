# MCP-UI FastMCP Demo

A minimal demonstration project showcasing the integration of **FastMCP** and **mcp-ui**. This project provides a working MCP server with interactive UI components, demonstrating core capabilities of both frameworks.

## Features

- ✅ **Greeting Tool** - Personalized greeting with interactive button
- ✅ **Button Tool** - Handle button click events from UI components
- ✅ **Counter Tool** - Interactive counter with increment/decrement controls
- ✅ **Type-Safe** - Zod schema validation for all tool parameters
- ✅ **Interactive UI** - Rich UI components using mcp-ui
- ✅ **HTTP Streaming** - Production-ready FastMCP server

## Prerequisites

- Node.js 20+
- npm

## Installation

```bash
npm install
```

## Development

### Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:8080` with the following endpoints:
- **MCP endpoint**: `http://localhost:8080/mcp`
- **SSE endpoint**: `http://localhost:8080/sse`
- **Health check**: `http://localhost:8080/ready`

### Build for Production

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run typecheck
```

## Testing

### Run All Tests

```bash
npm test
```

### Watch Mode

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

## MCP Development Tools

### FastMCP CLI

Test the server with the FastMCP CLI:

```bash
npm run mcp:dev
```

### MCP Inspector

Visual debugging with MCP Inspector:

```bash
npm run mcp:inspect
```

This opens a web interface where you can:
- View all available tools
- Test tool invocations
- See UIResource rendering in real-time
- Debug interactive components

## Available Tools

### 1. greet

Generate a personalized greeting with an interactive UI component.

**Parameters:**
- `name` (string, required) - Name to greet (must be non-empty)

**Example:**
```json
{
  "name": "Alice"
}
```

**Returns:** UIResource with personalized greeting and clickable button

### 2. button

Handle button click events from UI components and return confirmation.

**Parameters:**
- `action` (string, required) - Action identifier
- `source` (string, optional) - Source of the button click

**Example:**
```json
{
  "action": "greeting-button-clicked",
  "source": "greeting-ui"
}
```

**Returns:** UIResource with action confirmation details

### 3. counter

Display an interactive counter with increment and decrement buttons.

**Parameters:**
- `count` (number, required) - Current counter value

**Example:**
```json
{
  "count": 0
}
```

**Returns:** UIResource with counter display and interactive buttons

## Project Structure

```
mcp-ui-fastmcp-demo/
├── src/
│   ├── index.ts           # Server entry point
│   ├── tools/
│   │   ├── greeting.ts    # Greeting tool
│   │   ├── button.ts      # Button tool
│   │   └── counter.ts     # Counter tool
│   └── utils/
│       └── ui-factory.ts  # UIResource creation utilities
├── tests/
│   ├── unit/              # Unit tests
│   └── properties/        # Property-based tests
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## How It Works

### 1. FastMCP Server

The server is initialized with FastMCP and configured for HTTP streaming:

```typescript
const server = new FastMCP({
  name: "MCP-UI FastMCP Demo",
  version: "1.0.0"
});

server.start({
  transportType: "httpStream",
  httpStream: { port: 8080 }
});
```

### 2. Tool Registration

Each tool is defined with Zod schema validation:

```typescript
export const greetingTool = {
  name: 'greet',
  description: 'Generate a personalized greeting',
  parameters: z.object({
    name: z.string().min(1)
  }),
  execute: async (args) => {
    // Tool logic
  }
};

server.addTool(greetingTool);
```

### 3. UIResource Creation

UIResources are created using `@mcp-ui/server`:

```typescript
import { createUIResource } from '@mcp-ui/server';

const uiResource = createUIResource({
  uri: 'ui://greeting/alice',
  content: {
    type: 'rawHtml',
    htmlString: '<div>Hello, Alice!</div>'
  },
  encoding: 'text',
  metadata: {
    title: 'Greeting',
    description: 'Personalized greeting'
  }
});
```

### 4. Interactive Components

UI components communicate with the server using `postMessage`:

```javascript
window.parent.postMessage({
  type: 'tool',
  payload: {
    toolName: 'button',
    params: { action: 'clicked' }
  }
}, '*');
```

## Best Practices Demonstrated

- ✅ Semantic URIs (`ui://resource-type/id`)
- ✅ Inline CSS for all styling
- ✅ Metadata with title and description
- ✅ PostMessage for interactive elements
- ✅ Zod schema validation
- ✅ Type-safe tool definitions
- ✅ Error handling
- ✅ Proper TypeScript configuration

## Learn More

- [FastMCP Documentation](https://github.com/punkpeye/fastmcp)
- [mcp-ui Documentation](https://mcpui.dev/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Zod Documentation](https://zod.dev/)

## License

MIT
