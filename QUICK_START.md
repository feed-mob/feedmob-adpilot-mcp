# Quick Start Guide

## Prerequisites

Install [just](https://github.com/casey/just):

```bash
# macOS
brew install just

# Linux
curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to /usr/local/bin

# Or use cargo
cargo install just
```

## Setup (First Time)

```bash
# 1. Install dependencies
just install

# 2. Setup development environment (starts database + runs migrations)
just setup

# 3. Configure environment variables
cp .env.example .env
# Edit .env and add your API keys:
#   - ANTHROPIC_API_KEY
#   - GOOGLE_CLIENT_ID
#   - GOOGLE_CLIENT_SECRET
```

## Daily Development

```bash
# Start development server
just dev

# In another terminal, view database logs if needed
just db-logs
```

## Common Commands

```bash
# View all available commands
just

# Database
just db-start          # Start database
just db-stop           # Stop database
just db-shell          # Access PostgreSQL CLI
just db-info           # Show connection details

# Testing
just test              # Run tests
just mcp-inspect       # Visual MCP debugging

# Cleanup
just stop              # Stop everything
just clean-all         # Remove everything (db data, node_modules, etc.)
```

## Troubleshooting

### Database won't start
```bash
# Check if port 5432 is already in use
lsof -i :5432

# Clean and restart
just db-clean
just db-start
```

### Migrations fail
```bash
# Reset database
just db-reset
```

### TypeScript errors
```bash
# Check types
just typecheck

# Reinstall dependencies
just clean-all
just install
```

## Project Structure

```
feedmob-adpilot-mcp/
├── src/
│   ├── index.ts           # Main entry point
│   ├── config/            # Configuration
│   ├── services/          # Business logic
│   ├── tools/             # MCP tools
│   ├── types/             # TypeScript types
│   ├── utils/             # Utilities
│   └── db/                # Database migrations
├── tests/                 # Test files
├── justfile               # Development commands
├── docker-compose.yaml    # Database setup
└── .env                   # Your configuration (create from .env.example)
```

## Next Steps

1. Implement the remaining tasks from `.kiro/specs/feedmob-adpilot-mcp/tasks.md`
2. Start with Task 2: Set up database layer
3. Test each component as you build it using `just mcp-inspect`

## Resources

- [FastMCP Documentation](https://github.com/punkpeye/fastmcp)
- [MCP-UI Documentation](https://mcpui.dev/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
