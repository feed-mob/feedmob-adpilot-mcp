# MCP-UI Chat Client

A Next.js chat interface that connects to MCP (Model Context Protocol) servers and renders interactive UI components using the mcp-ui library. This client uses AWS Bedrock with Claude Haiku for AI conversations and supports rich, interactive UIResources from MCP tool responses.

## Features

- 🤖 **AI Chat with Claude Haiku** via AWS Bedrock
- 🔧 **MCP Tool Integration** with HTTP streaming transport
- 🎨 **Interactive UI Components** using @mcp-ui/client
- 💾 **Chat History** with localStorage persistence
- 🌓 **Dark Mode** support
- 📱 **Responsive Design** for mobile and desktop
- ✅ **Property-Based Testing** with fast-check

## Prerequisites

- Node.js 20+
- AWS Account with Bedrock access
- MCP Server (e.g., AdPilot MCP Server)

## Installation

1. Install dependencies:

```bash
npm install
```

2. Copy the environment example file:

```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:

```env
# AWS Bedrock Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=us.anthropic.claude-haiku-4-5-20251001-v1:0

# MCP Server Configuration
MCP_SERVER_URL=http://localhost:8080/mcp
```

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
npm run build
npm start
```

## Testing

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage:

```bash
npm run test:coverage
```

Type checking:

```bash
npm run typecheck
```

## Project Structure

```
client-ui/client-ui/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── chat/            # Bedrock streaming endpoint
│   │   └── mcp/             # MCP tool execution
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main chat page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── chat-container.tsx   # Main chat orchestrator
│   ├── message-list.tsx     # Message display
│   ├── message-item.tsx     # Individual message
│   ├── text-message.tsx     # Markdown text rendering
│   ├── tool-call-message.tsx # Tool call display
│   ├── ui-resource-message.tsx # UIResource renderer
│   ├── chat-input.tsx       # Message input
│   ├── connection-status.tsx # MCP connection status
│   └── chat-history.tsx     # Session history
├── lib/                     # Core libraries
│   ├── services/            # Service layer
│   │   ├── bedrock.ts       # AWS Bedrock service
│   │   ├── mcp-client.ts    # MCP client service
│   │   └── storage.ts       # LocalStorage service
│   ├── types.ts             # TypeScript types
│   ├── serialization.ts     # Message serialization
│   └── env.ts               # Environment validation
└── __tests__/               # Test files
    ├── properties/          # Property-based tests
    ├── unit/                # Unit tests
    └── integration/         # Integration tests
```

## Architecture

### Services

- **BedrockService**: Handles communication with AWS Bedrock using the ConverseStream API
- **MCPClientService**: Manages connection to MCP servers via HTTP streaming transport using FastMCP client
- **StorageService**: Persists chat sessions to localStorage

### Components

- **ChatContainer**: Main orchestrator that coordinates AI responses, tool calls, and UI updates
- **MessageList**: Displays conversation history with auto-scroll
- **UIResourceMessage**: Renders interactive UI components from MCP tool responses using @mcp-ui/client

### Data Flow

1. User sends message → ChatContainer
2. ChatContainer streams response from Bedrock
3. If tool call detected → Execute via MCPClient
4. If tool returns UIResource → Render with UIResourceRenderer
5. UIResource actions → Handle via MCPClient
6. Messages persisted → StorageService

## MCP-UI Integration

This client uses [@mcp-ui/client](https://github.com/idosal/mcp-ui) to render interactive UI components from MCP tool responses. UIResources with `ui://` URI schemes are automatically detected and rendered with full interactivity support.

### Supported UIResource Types

- **Raw HTML**: Inline HTML content rendered in sandboxed iframe
- **External URLs**: External web pages loaded in iframe
- **Remote DOM**: JavaScript-based UI with React/Web Components

### UI Actions

The client handles the following UI actions from rendered components:

- `tool`: Execute MCP tools
- `prompt`: Display prompts to user
- `notify`: Show notifications
- `link`: Open external links
- `intent`: Handle custom intents

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AWS_ACCESS_KEY_ID` | AWS access key for Bedrock | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for Bedrock | Yes |
| `AWS_REGION` | AWS region (e.g., us-east-1) | Yes |
| `BEDROCK_MODEL_ID` | Claude model ID | No (defaults to Haiku) |
| `MCP_SERVER_URL` | MCP server endpoint URL | Yes |

## Troubleshooting

### MCP Server Connection Failed

- Verify `MCP_SERVER_URL` is correct
- Ensure MCP server is running
- Check network connectivity

### AWS Bedrock Errors

- Verify AWS credentials are valid
- Ensure Bedrock access is enabled in your AWS account
- Check AWS region supports Claude models

### UIResource Not Rendering

- Verify resource has `ui://` URI scheme
- Check browser console for errors
- Ensure mimeType is supported

## License

Apache 2.0
