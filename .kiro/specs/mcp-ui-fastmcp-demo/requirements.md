# Requirements Document

## Introduction

A minimal demonstration project that showcases FastMCP and mcp-ui integration. The system provides a working MCP server with interactive UI components, demonstrating core capabilities of both frameworks. This serves as a foundation for building more complex MCP applications.

## Glossary

- **Demo System**: The MCP server application built with FastMCP and mcp-ui
- **MCP Client**: The client application that connects to the Demo System via MCP protocol
- **UIResource**: An interactive UI component rendered via mcp-ui in the MCP Client
- **User**: The person interacting with the Demo System through an MCP Client

## Requirements

### Requirement 1

**User Story:** As a user, I want to call a greeting tool, so that I can see a personalized interactive UI response.

#### Acceptance Criteria

1. WHEN a user invokes the greeting tool with a name parameter THEN the Demo System SHALL accept the name as a string
2. WHEN the name parameter is empty THEN the Demo System SHALL reject the request with a validation error
3. WHEN the greeting tool executes successfully THEN the Demo System SHALL return a UIResource containing a personalized greeting
4. WHEN the UIResource is displayed THEN the UIResource SHALL show the user's name in a styled HTML component

### Requirement 2

**User Story:** As a user, I want to interact with UI buttons, so that I can trigger additional tool calls from the interface.

#### Acceptance Criteria

1. WHEN a UIResource is displayed THEN the UIResource SHALL include an interactive button element
2. WHEN a user clicks the button THEN the UIResource SHALL send a postMessage to invoke another tool
3. WHEN the button tool is invoked THEN the Demo System SHALL process the request and return a response
4. WHEN the button tool completes THEN the Demo System SHALL return a UIResource showing the action result

### Requirement 3

**User Story:** As a user, I want to see a counter demo, so that I can understand stateful interactions in mcp-ui.

#### Acceptance Criteria

1. WHEN a user invokes the counter tool THEN the Demo System SHALL return a UIResource with a counter display
2. WHEN the counter UIResource is displayed THEN the UIResource SHALL show the current count value
3. WHEN a user clicks increment in the UIResource THEN the UIResource SHALL send a postMessage to increment the counter
4. WHEN a user clicks decrement in the UIResource THEN the UIResource SHALL send a postMessage to decrement the counter
5. WHEN the counter tool is invoked with a count parameter THEN the Demo System SHALL update and return the new count value

### Requirement 4

**User Story:** As a developer, I want the server to use FastMCP with HTTP streaming, so that the MCP server is production-ready.

#### Acceptance Criteria

1. WHEN the Demo System starts THEN the Demo System SHALL initialize a FastMCP server on port 8080
2. WHEN the Demo System starts THEN the Demo System SHALL expose the MCP endpoint at /mcp
3. WHEN the Demo System starts THEN the Demo System SHALL expose a health check endpoint at /ready
4. WHEN an MCP Client connects THEN the Demo System SHALL support HTTP streaming transport

### Requirement 5

**User Story:** As a developer, I want all tool parameters validated with Zod schemas, so that type safety is enforced.

#### Acceptance Criteria

1. WHEN defining a tool THEN the Demo System SHALL specify parameter schemas using Zod
2. WHEN a tool is invoked with invalid parameters THEN the Demo System SHALL reject the request with a validation error
3. WHEN a tool is invoked with valid parameters THEN the Demo System SHALL execute the tool logic

### Requirement 6

**User Story:** As a developer, I want UIResources to follow mcp-ui best practices, so that components render correctly.

#### Acceptance Criteria

1. WHEN creating a UIResource THEN the Demo System SHALL use semantic URIs in the format ui://resource-type/id
2. WHEN creating a UIResource THEN the Demo System SHALL include inline CSS styles
3. WHEN creating a UIResource THEN the Demo System SHALL include metadata with title and description
4. WHEN a UIResource contains interactive elements THEN the Demo System SHALL use postMessage for client communication
