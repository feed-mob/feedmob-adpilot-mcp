# Requirements Document

## Introduction

This document specifies the requirements for an MCP-UI Chat Client - a web-based chat interface that connects to MCP (Model Context Protocol) servers and renders interactive UI components from tool responses using the mcp-ui library. Unlike standard MCP clients that only display text responses, this client can render rich, interactive HTML components, external URLs, and Remote DOM resources returned by MCP servers.

The client will be built as a separate Next.js project in a sibling folder to the main feedmob-adpilot-mcp project, enabling users to interact with the AdPilot MCP server and see interactive UI components for campaign parameters, ad copy, research results, and generated images.

## Glossary

- **MCP (Model Context Protocol)**: A protocol that enables AI models to interact with external tools and services through a standardized interface
- **MCP Server**: A server that exposes tools and resources via the MCP protocol
- **MCP Client**: An application that connects to MCP servers and invokes their tools
- **UIResource**: A structured object containing UI content (HTML, URL, or Remote DOM script) that can be rendered in the client
- **HTTP Streaming Transport**: A transport mechanism for MCP communication using HTTP with streaming responses
- **stdio**: Standard input/output transport for local MCP servers
- **Remote DOM**: A technique for securely rendering server-defined UI using host-native components
- **AWS Bedrock**: Amazon's fully managed service for accessing foundation models via API
- **Claude Haiku**: Anthropic's fast, efficient AI model (us.anthropic.claude-haiku-4-5-20251001-v1:0) accessed via AWS Bedrock
- **Bedrock Runtime Client**: AWS SDK client for invoking foundation models with streaming support
- **Tool Call**: An invocation of an MCP tool that may return text, resources, or UIResources
- **Chat Session**: A conversation thread between the user and AI that may include multiple tool calls

## Requirements

### Requirement 1

**User Story:** As a user, I want to send messages to an AI assistant that can use MCP tools, so that I can interact with external services through natural language.

#### Acceptance Criteria

1. WHEN a user types a message and submits it THEN the Chat_Client SHALL send the message to AWS Bedrock using the Claude Haiku model and display the response
2. WHEN the AI response includes text content THEN the Chat_Client SHALL render the text with proper markdown formatting
3. WHEN the AI decides to call an MCP tool THEN the Chat_Client SHALL display the tool call status and execute the tool via the connected MCP server
4. WHEN a tool call completes THEN the Chat_Client SHALL display the tool result and continue the conversation with the AI
5. WHEN the AI is generating a response THEN the Chat_Client SHALL display a streaming indicator to show progress

### Requirement 2

**User Story:** As a user, I want to see interactive UI components from MCP tool responses, so that I can view and interact with rich content instead of plain text.

#### Acceptance Criteria

1. WHEN a tool response contains a UIResource with `ui://` URI scheme THEN the Chat_Client SHALL render it using the UIResourceRenderer component
2. WHEN a UIResource contains raw HTML content THEN the Chat_Client SHALL render it in a sandboxed iframe
3. WHEN a UIResource contains an external URL THEN the Chat_Client SHALL render the URL in an iframe with appropriate security restrictions
4. WHEN a UIResource contains a Remote DOM script THEN the Chat_Client SHALL execute it using the Remote DOM renderer with the configured component library
5. WHEN a rendered UIResource posts a message via postMessage THEN the Chat_Client SHALL handle the action according to its type (tool, prompt, notify, link, intent)

### Requirement 3

**User Story:** As a user, I want the chat client to connect to the AdPilot MCP server, so that I can use the advertising tools through the chat interface.

#### Acceptance Criteria

1. WHEN the Chat_Client starts THEN the Chat_Client SHALL read the MCP server URL from the MCP_SERVER_URL environment variable
2. WHEN the MCP_SERVER_URL is configured THEN the Chat_Client SHALL establish an HTTP streaming connection to the MCP server
3. WHEN the MCP server connection is established THEN the Chat_Client SHALL discover available tools and make them accessible to the AI
4. WHEN the MCP server connection fails THEN the Chat_Client SHALL display an error message with the connection status
5. WHEN the MCP_SERVER_URL is not configured THEN the Chat_Client SHALL display a configuration error message

### Requirement 4

**User Story:** As a user, I want the chat client to use AWS Bedrock with Claude Haiku for AI conversations, so that I can leverage enterprise-grade AI capabilities.

#### Acceptance Criteria

1. WHEN the Chat_Client initializes THEN the Chat_Client SHALL configure the AWS Bedrock Runtime Client with credentials from environment variables
2. WHEN sending messages to the AI THEN the Chat_Client SHALL invoke the us.anthropic.claude-haiku-4-5-20251001-v1:0 model using the Bedrock ConverseStream API
3. WHEN AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION) are not configured THEN the Chat_Client SHALL display an error message indicating missing configuration
4. WHEN the Bedrock API returns a rate limit or throttling error THEN the Chat_Client SHALL display a user-friendly message and allow retry

### Requirement 5

**User Story:** As a user, I want UI actions from rendered components to trigger appropriate responses, so that I can interact with the UI and continue the workflow.

#### Acceptance Criteria

1. WHEN a UIResource action of type 'tool' is received THEN the Chat_Client SHALL call the specified MCP tool with the provided parameters
2. WHEN a UIResource action of type 'prompt' is received THEN the Chat_Client SHALL display the prompt text to the user and allow them to respond
3. WHEN a UIResource action of type 'notify' is received THEN the Chat_Client SHALL display a notification with the provided message
4. WHEN a UIResource action of type 'link' is received THEN the Chat_Client SHALL open the URL in a new browser tab
5. WHEN a UIResource action includes a messageId THEN the Chat_Client SHALL send a response message back to the iframe with the action result

### Requirement 6

**User Story:** As a user, I want to manage my chat history, so that I can review past conversations and start new ones.

#### Acceptance Criteria

1. WHEN a user starts a new conversation THEN the Chat_Client SHALL create a new chat session and clear the message display
2. WHEN messages are exchanged THEN the Chat_Client SHALL persist the conversation to local storage or database
3. WHEN a user views the chat history THEN the Chat_Client SHALL display a list of previous conversations with timestamps
4. WHEN a user selects a previous conversation THEN the Chat_Client SHALL load and display that conversation's messages

### Requirement 7

**User Story:** As a user, I want the chat interface to be responsive and visually appealing, so that I can use it comfortably on different devices.

#### Acceptance Criteria

1. WHEN the Chat_Client loads THEN the Chat_Client SHALL display a clean, modern interface with a message input area and conversation display
2. WHEN viewed on mobile devices THEN the Chat_Client SHALL adapt the layout to fit smaller screens
3. WHEN the user prefers dark mode THEN the Chat_Client SHALL render with a dark color scheme
4. WHEN UIResources are rendered THEN the Chat_Client SHALL size the iframe appropriately based on content or metadata hints

### Requirement 8

**User Story:** As a developer, I want the chat client to handle errors gracefully, so that users understand what went wrong and can recover.

#### Acceptance Criteria

1. WHEN an MCP server connection fails THEN the Chat_Client SHALL display an error message and offer retry options
2. WHEN a tool call fails THEN the Chat_Client SHALL display the error to the user and allow the conversation to continue
3. WHEN the AI provider returns an error THEN the Chat_Client SHALL display a user-friendly error message
4. WHEN a UIResource fails to render THEN the Chat_Client SHALL display a fallback error state instead of breaking the UI

### Requirement 9

**User Story:** As a developer, I want the client to serialize and deserialize chat messages correctly, so that conversations can be persisted and restored.

#### Acceptance Criteria

1. WHEN a chat message is saved THEN the Chat_Client SHALL serialize all message content including tool calls and UIResources to JSON
2. WHEN a chat message is loaded THEN the Chat_Client SHALL deserialize the JSON and restore the message with all its content
3. WHEN serializing a message with UIResource THEN the Chat_Client SHALL preserve the resource URI, mimeType, and content
4. WHEN deserializing a message THEN the Chat_Client SHALL validate the structure against the expected schema
