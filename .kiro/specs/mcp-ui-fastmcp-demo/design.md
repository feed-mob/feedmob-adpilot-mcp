# Design Document

## Overview

This design document outlines a minimal demonstration project that showcases the integration of FastMCP and mcp-ui. The system provides a working MCP server with three interactive tools: a greeting tool, a button interaction tool, and a counter tool. Each tool returns UIResources that demonstrate different aspects of mcp-ui capabilities, from simple HTML rendering to stateful interactions.

The project serves as a foundation for understanding how to build MCP servers with rich, interactive UI components. It demonstrates type-safe tool definitions using Zod schemas, proper UIResource creation following mcp-ui best practices, and interactive communication between UI components and the MCP server.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   MCP Client    │
│  (Inspector/    │
│   Claude, etc)  │
└────────┬────────┘
         │ HTTP Streaming
         │ (port 8080)
         ▼
┌─────────────────┐
│  FastMCP Server │
│                 │
│  ┌───────────┐  │
│  │  Tools    │  │
│  │  - greet  │  │
│  │  - button │  │
│  │  - counter│  │
│  └───────────┘  │
│                 │
│  ┌───────────┐  │
│  │ mcp-ui    │  │
│  │ Resources │  │
│  └───────────┘  │
└─────────────────┘
```

### Transport Layer

- **Protocol**: HTTP Streaming with SSE support
- **Port**: 8080
- **Endpoints**:
  - `/mcp` - Main MCP endpoint
  - `/sse` - Server-sent events endpoint
  - `/ready` - Health check endpoint

### Tool Architecture

Each tool follows a consistent pattern:
1. Accept parameters validated by Zod schemas
2. Process the request
3. Generate a UIResource using `@mcp-ui/server`
4. Return the UIResource in the tool response

## Components and Interfaces

### 1. FastMCP Server

**Responsibility**: Initialize and manage the MCP server, handle tool registration, and manage HTTP transport.

**Interface**:
```typescript
interface ServerConfig {
  name: string;
  version: string;
}

interface HttpStreamConfig {
  port: number;
  endpoint?: string;
}
```

**Implementation Details**:
- Uses FastMCP framework for server initialization
- Configures HTTP streaming transport on port 8080
- Registers all tools during startup
- No authentication required for this demo

### 2. Greeting Tool

**Responsibility**: Accept a user's name and return a personalized greeting in an interactive UI.

**Interface**:
```typescript
interface GreetingParams {
  name: string;
}

interface GreetingToolResponse {
  content: UIResource[];
}
```

**Implementation Details**:
- Validates `name` parameter is non-empty string using Zod
- Creates UIResource with semantic URI: `ui://greeting/{name}`
- Returns HTML with inline CSS styling
- Includes interactive button that triggers the button tool
- Uses postMessage for button interaction

### 3. Button Tool

**Responsibility**: Handle button click events from UIResources and return confirmation.

**Interface**:
```typescript
interface ButtonParams {
  action: string;
  source?: string;
}

interface ButtonToolResponse {
  content: UIResource[];
}
```

**Implementation Details**:
- Validates `action` parameter as string
- Accepts optional `source` parameter to identify origin
- Creates UIResource with semantic URI: `ui://button-response/{timestamp}`
- Returns confirmation message with action details
- Demonstrates tool invocation from UI components

### 4. Counter Tool

**Responsibility**: Maintain and display a counter value with increment/decrement controls.

**Interface**:
```typescript
interface CounterParams {
  count: number;
}

interface CounterToolResponse {
  content: UIResource[];
}
```

**Implementation Details**:
- Validates `count` parameter as number
- Creates UIResource with semantic URI: `ui://counter/{count}`
- Returns HTML with current count display
- Includes increment and decrement buttons
- Each button triggers counter tool with updated value
- Demonstrates stateful interactions through tool parameters

### 5. UIResource Factory

**Responsibility**: Create properly formatted UIResources following mcp-ui best practices.

**Interface**:
```typescript
interface UIResourceOptions {
  uri: string;
  content: {
    type: 'rawHtml';
    htmlString: string;
  };
  encoding: 'text';
  metadata?: {
    title?: string;
    description?: string;
    [key: string]: any;
  };
}
```

**Implementation Details**:
- Uses `createUIResource` from `@mcp-ui/server`
- Ensures semantic URIs (format: `ui://resource-type/id`)
- Includes inline CSS for all styling
- Adds metadata with title and description
- Uses postMessage for all interactive elements

## Data Models

### UIResource Structure

```typescript
interface UIResource {
  type: 'resource';
  resource: {
    uri: string;
    mimeType: 'text/html';
    text: string;
    _meta?: {
      title?: string;
      description?: string;
      [key: string]: any;
    };
  };
}
```

### Tool Response Structure

```typescript
interface ToolResponse {
  content: Array<{
    type: 'resource';
    resource: {
      uri: string;
      mimeType: string;
      text: string;
      _meta?: Record<string, any>;
    };
  }>;
}
```

### PostMessage Event Structure

```typescript
interface UIActionMessage {
  type: 'tool' | 'notify' | 'prompt' | 'link' | 'intent';
  payload: {
    toolName?: string;
    params?: Record<string, any>;
    message?: string;
    prompt?: string;
    url?: string;
    intent?: string;
  };
  messageId?: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Non-empty name validation

*For any* greeting tool invocation with an empty name parameter, the system should reject the request with a validation error
**Validates: Requirements 1.2**

### Property 2: UIResource structure compliance

*For any* tool execution that returns a UIResource, the resource should contain a semantic URI starting with "ui://", include inline CSS styles, and have metadata with title and description
**Validates: Requirements 6.1, 6.2, 6.3**

### Property 3: Button interaction round-trip

*For any* button click in a UIResource, the postMessage should successfully invoke the button tool and return a confirmation UIResource
**Validates: Requirements 2.2, 2.3, 2.4**

### Property 4: Counter state consistency

*For any* counter value, incrementing then decrementing should return to the original value
**Validates: Requirements 3.3, 3.4**

### Property 5: Parameter validation enforcement

*For any* tool invocation with invalid parameters (wrong type or missing required fields), the system should reject the request before executing tool logic
**Validates: Requirements 5.2, 5.3**

## Error Handling

### Validation Errors

**Scenario**: Tool invoked with invalid parameters
**Handling**:
- Zod schema validation catches errors before tool execution
- Return descriptive error message indicating which parameter is invalid
- Include expected type/format in error message

**Example**:
```typescript
// Invalid: empty name
{ name: "" }
// Error: "name must be a non-empty string"

// Invalid: count is string
{ count: "5" }
// Error: "count must be a number"
```

### Tool Execution Errors

**Scenario**: Unexpected error during tool execution
**Handling**:
- Catch all errors in tool execute function
- Log error details to console
- Return user-friendly error message
- Do not expose internal error details to client

**Example**:
```typescript
try {
  const uiResource = createUIResource({...});
  return { content: [uiResource] };
} catch (error) {
  console.error('Tool execution error:', error);
  throw new Error('Failed to generate UI component');
}
```

### UIResource Creation Errors

**Scenario**: Invalid UIResource configuration
**Handling**:
- Validate URI format before creation
- Ensure HTML content is properly escaped
- Verify metadata structure
- Return error if UIResource creation fails

### Server Startup Errors

**Scenario**: Server fails to start (port in use, invalid config)
**Handling**:
- Log detailed error message
- Exit process with non-zero code
- Provide actionable error message (e.g., "Port 8080 already in use")

## Testing Strategy

### Unit Testing

**Framework**: Vitest

**Test Coverage**:

1. **Tool Parameter Validation**
   - Test each tool with valid parameters
   - Test each tool with invalid parameters (empty strings, wrong types, missing fields)
   - Verify Zod validation errors are thrown

2. **UIResource Creation**
   - Test UIResource structure matches expected format
   - Verify semantic URI format
   - Verify metadata presence
   - Test HTML content generation

3. **Error Handling**
   - Test validation error messages
   - Test tool execution error handling
   - Verify error messages are user-friendly

### Property-Based Testing

**Framework**: fast-check (minimum 100 iterations per property)

**Property Test Requirements**:
- Each property-based test MUST run at least 100 iterations
- Each test MUST be tagged with a comment referencing the design document property
- Tag format: `// Feature: mcp-ui-fastmcp-demo, Property {number}: {property_text}`
- Each correctness property MUST be implemented by a SINGLE property-based test

**Property Tests**:

1. **Property 1: Non-empty name validation**
   ```typescript
   // Feature: mcp-ui-fastmcp-demo, Property 1: Non-empty name validation
   ```
   - Generate random whitespace-only strings
   - Verify all are rejected with validation error
   - Verify error message mentions "name"

2. **Property 2: UIResource structure compliance**
   ```typescript
   // Feature: mcp-ui-fastmcp-demo, Property 2: UIResource structure compliance
   ```
   - Generate random valid tool parameters
   - Execute each tool
   - Verify all returned UIResources have:
     - URI starting with "ui://"
     - Inline CSS in HTML content
     - Metadata with title and description

3. **Property 3: Button interaction round-trip**
   ```typescript
   // Feature: mcp-ui-fastmcp-demo, Property 3: Button interaction round-trip
   ```
   - Generate random action strings
   - Simulate button click postMessage
   - Verify button tool returns UIResource
   - Verify response contains action details

4. **Property 4: Counter state consistency**
   ```typescript
   // Feature: mcp-ui-fastmcp-demo, Property 4: Counter state consistency
   ```
   - Generate random integer counter values
   - Increment then decrement each value
   - Verify result equals original value

5. **Property 5: Parameter validation enforcement**
   ```typescript
   // Feature: mcp-ui-fastmcp-demo, Property 5: Parameter validation enforcement
   ```
   - Generate random invalid parameters (wrong types, missing fields)
   - Attempt to invoke tools
   - Verify all are rejected before tool logic executes
   - Verify validation error is thrown

### Integration Testing

**Test Scenarios**:

1. **Server Startup**
   - Start server
   - Verify health check endpoint responds
   - Verify MCP endpoint is accessible

2. **End-to-End Tool Execution**
   - Connect MCP client
   - Invoke greeting tool
   - Verify UIResource is returned
   - Parse HTML and verify structure

3. **Interactive UI Flow**
   - Invoke greeting tool
   - Extract button postMessage code
   - Simulate button click
   - Verify button tool is invoked
   - Verify response UIResource

4. **Counter State Flow**
   - Invoke counter with initial value
   - Simulate increment button
   - Verify new counter value
   - Simulate decrement button
   - Verify returns to original value

### Manual Testing with MCP Inspector

**Tool**: `npx fastmcp inspect src/index.ts`

**Test Cases**:
1. Visual inspection of greeting UI
2. Click button interactions
3. Counter increment/decrement
4. Verify styling and layout
5. Test error scenarios

## Implementation Notes

### Technology Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.3+ with strict mode
- **Module System**: ESM
- **Package Manager**: npm

### Key Dependencies

- `fastmcp` (^3.23.1) - MCP server framework
- `@mcp-ui/server` (^5.13.1) - UI resource creation
- `zod` (^3.22.0) - Parameter validation
- `tsx` (^4.7.0) - TypeScript execution
- `vitest` (^1.2.0) - Testing framework
- `fast-check` (^3.15.0) - Property-based testing

### Project Structure

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
│   ├── unit/
│   │   ├── greeting.test.ts
│   │   ├── button.test.ts
│   │   └── counter.test.ts
│   └── properties/
│       ├── validation.property.test.ts
│       ├── ui-structure.property.test.ts
│       ├── button-interaction.property.test.ts
│       ├── counter-state.property.test.ts
│       └── parameter-validation.property.test.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

### Development Commands

```bash
# Development
npm run dev              # Start with watch mode
npm run build            # Compile TypeScript
npm start                # Run production build

# Testing
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# MCP Development
npm run mcp:dev          # Test with FastMCP CLI
npm run mcp:inspect      # Visual debugging
```

### Environment Configuration

No environment variables required for this minimal demo. All configuration is hardcoded for simplicity.

### Security Considerations

- No authentication required (demo only)
- All UIResources render in sandboxed iframes
- PostMessage communication is origin-validated by mcp-ui client
- No external data sources or databases
- No sensitive data handling

### Performance Considerations

- Stateless server design (no session storage)
- Minimal memory footprint
- Fast tool execution (< 100ms)
- No database queries or external API calls
- Suitable for local development and testing

### Extensibility

This minimal demo can be extended with:
- Additional tools demonstrating other mcp-ui features
- Authentication using FastMCP's authenticate hook
- Database integration for persistent state
- External API integrations
- More complex UI components (forms, charts, etc.)
- Remote DOM resources instead of raw HTML
