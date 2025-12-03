# How I Built FeedMob AdPilot with Kiro

This document showcases how I leveraged Kiro IDE's AI-powered features to develop the FeedMob AdPilot MCP Server - an AI-powered advertising campaign planning and creative generation system.

---

## Project Overview

**FeedMob AdPilot** is a comprehensive MCP (Model Context Protocol) server that enables advertisers to:
- Parse natural language campaign requirements
- Conduct AI-powered advertising research
- Generate ad copy variations
- Create ad images
- Manage campaign data
- Display interactive UI widgets using mcp-ui for rich user experiences

Built with FastMCP, Claude Agent SDK, mcp-ui for UI components, and PostgreSQL.

---

## 1. Development Modes: Vibe & Spec

Kiro offers two complementary coding modes - **Vibe** and **Spec** - and I use them strategically based on the task complexity.

### When I Use Each Mode

**Spec Mode** - For structured, traceable development:
- New MCP tools (parseAdRequirements, conductAdResearch, etc.)
- Database schema design
- Agent service architecture
- Client UI implementation
- Deployment configuration
- Any feature requiring formal requirements and design

**Vibe Mode** - For rapid iterations and quick fixes:
- Bug fixes discovered during testing
- UI styling adjustments
- Error message improvements
- Adding validation edge cases
- Refactoring small functions
- Minor feature updates

### Spec-Driven Development

I used Kiro Specs to formally define and implement 10 major features with full traceability from requirements to implementation.

#### Specs I Created

| Spec | Purpose |
|------|---------|
| `parse-ad-requirements` | NLP extraction of campaign parameters |
| `conduct-ad-research` | AI-powered market research |
| `generate-ad-copy` | Ad copy variation generation |
| `generate-ad-images` | Image generation with selection UI |
| `campaign-data-persistence` | PostgreSQL data layer |
| `health-check-endpoints` | Server monitoring |
| `mcp-ui-chat-client` | Next.js chat interface |
| `mcp-ui-fastmcp-demo` | MCP-UI integration demo |
| `feedmob-adpilot-mcp` | Core server architecture |
| `docker-coolify-deployment` | Production deployment |

#### Spec Structure

Each spec contains three documents that Kiro helped me iterate on:

```
.kiro/specs/parse-ad-requirements/
├── requirements.md    # User stories + acceptance criteria
├── design.md          # Architecture + correctness properties
└── tasks.md           # Implementation checklist
```


### Vibe Mode Development

For quick iterations, Vibe mode enables natural language development through conversation.

#### Example Interaction

```
Me: Create a new MCP tool for generating ad images based on the pattern 
    in #File src/tools/generate-ad-copy.ts

Kiro: [Generated the complete tool with schema, agent service, and UI factory]
```

### Benefits of Both Modes

**Spec Mode Benefits:**
- **Traceability**: Every line of code traces back to a requirement
- **Test Coverage**: Correctness properties become property-based tests
- **Incremental Progress**: Tasks provide clear implementation steps
- **Documentation**: Specs serve as living documentation

**Vibe Mode Benefits:**
- **Speed**: 10x faster for small changes and bug fixes
- **Flexibility**: Natural conversation without formal structure
- **Exploration**: Easy experimentation with patterns
- **Rapid Prototyping**: Quick proof-of-concepts

---

## 2. Steering Docs: Persistent Context

I created 7 steering documents to provide Kiro with project-specific knowledge that persists across all conversations.

### My Steering Documents

| Document | Purpose |
|----------|---------|
| `tech.md` | Technology stack, commands, environment setup |
| `fastmcp-integration.md` | FastMCP patterns and best practices |
| `mcp-ui-integration.md` | MCP-UI component creation guidelines |
| `agent-tool-patterns.md` | Claude Agent SDK integration patterns |
| `claude-agent-skills.md` | Agent skill development guide |
| `color-guidelines.md` | UI design system colors |
| `git-commits.md` | Commit message conventions (manual) |

### How They Helped

**Always-included docs** (like `tech.md`) ensured Kiro always knew:
- Use TypeScript with strict mode
- Use Zod for validation
- Follow the layered architecture pattern
- Use specific npm commands

**Example from tech.md:**
```markdown
## Common Commands
npm run dev              # Start dev server with watch mode
npm run mcp:inspect      # Visual debugging with MCP Inspector
npm test                 # Run Vitest suite
```

**Manual docs** (like `git-commits.md`) I referenced when needed:
```markdown
---
inclusion: manual
---
# Git Commit Guidelines
Use: feat, fix, chore, docs, style, refactor, test, perf
```

### Impact on Development

Without steering docs, I would have needed to repeat context in every conversation. With them:
- Kiro automatically used correct patterns
- Generated code followed project conventions
- Reduced back-and-forth clarifications

---

## 3. Agent Hooks: Automated Workflows

I configured 4 agent hooks to automate repetitive tasks and enforce quality standards.

### My Hooks

**1. Security Pre-Commit Scanner**
```json
{
  "name": "Security Pre-Commit Scanner",
  "when": {
    "type": "fileEdited",
    "patterns": ["**/*"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Review the changed files for potential security issues:
    1. Look for API keys, tokens, or credentials
    2. Check for private keys
    3. Scan for encryption keys..."
  }
}
```
Automatically scans every file edit for security issues.

**2. MCP-UI Docs Checker**
```json
{
  "name": "MCP-UI Docs Checker",
  "when": {
    "type": "fileEdited",
    "patterns": ["*mcp-ui*", "*mcp_ui*", "*mcpui*"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Before proceeding with any code changes to mcp-ui, 
    please call the mcp-ui-docs tool to fetch the most up-to-date 
    documentation..."
  }
}
```
Ensures mcp-ui changes align with latest documentation.

**3. MCP Builder Skill Hook**
```json
{
  "name": "MCP Builder Skill Hook",
  "when": {
    "type": "fileEdited",
    "patterns": ["src/index.ts", "src/tools/*.ts", "package.json"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Use the mcp-builder skill to analyze the changes and 
    help build or improve the MCP server implementation..."
  }
}
```
Provides MCP-specific guidance when editing server files.

**4. Agent Skills Builder**
```json
{
  "name": "Agent Skills Builder",
  "when": {
    "type": "fileEdited",
    "patterns": ["src/tools/*.ts", "src/services/*.ts"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Use the skill-creator skill to analyze the recently 
    edited file and build appropriate agent skills..."
  }
}
```
Helps create Claude Agent skills for new tools.

### Benefits

- **Automated Quality Checks**: Security scanning on every edit
- **Context-Aware Assistance**: Right guidance at the right time
- **Reduced Manual Steps**: No need to remember to check docs

---

## 4. MCP Integration: Extended Capabilities

I configured 6 MCP servers to extend Kiro's capabilities with external tools and documentation.

### My MCP Configuration

```json
{
  "mcpServers": {
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"],
      "autoApprove": []
    },
    "exa": {
      "url": "https://mcp.exa.ai/mcp",
      "autoApprove": ["get_code_context_exa"]
    },
    "context7": {
      "command": "bunx",
      "args": ["bunx", "-y", "@upstash/context7-mcp"],
      "autoApprove": ["resolve-library-id", "get-library-docs"]
    },
    "sequential-thinking": {
      "command": "bunx",
      "args": ["bunx", "-y", "@modelcontextprotocol/server-sequential-thinking"],
      "autoApprove": ["sequentialthinking"]
    },
    "mcp-ui-docs": {
      "url": "https://gitmcp.io/idosal/mcp-ui",
      "autoApprove": ["fetch_mcp_ui_documentation", "search_mcp_ui_documentation"]
    },
    "agent-skills": {
      "command": "uvx",
      "args": ["agent-skills-mcp"],
      "env": { "SKILL_FOLDER": "./.kiro/settings/skills" },
      "autoApprove": ["get_skill_skill-creator", "get_skill_mcp-builder"]
    }
  }
}
```

### How Each Server Helped

| Server | How I Used It |
|--------|---------------|
| **fetch** | Fetching external documentation and API specs |
| **exa** | Searching for code examples and best practices |
| **context7** | Getting library documentation (FastMCP, Zod, etc.) |
| **sequential-thinking** | Complex problem decomposition |
| **mcp-ui-docs** | Always up-to-date mcp-ui documentation |
| **agent-skills** | Loading skill-creator and mcp-builder skills |

### Skills I Used

Located in `.kiro/settings/skills/`:

**skill-creator**: Guided me in creating Claude Agent skills for:
- parse-ad-requirements skill
- conduct-ad-research skill
- generate-ad-copy skill

**mcp-builder**: Helped scaffold MCP server components:
- Tool definitions
- Schema validation
- Error handling patterns

---

## 5. Development Workflow Summary

Here's how all Kiro features worked together in my development workflow:

### My Two-Mode Approach

**Spec Mode for New Features** - When building major features:
1. **Create Spec** → Define requirements, design, and tasks
2. **Steering Context** → Kiro knows project patterns automatically
3. **Implement via Spec** → Work through tasks systematically
4. **Hooks Trigger** → Security scan + skill suggestions
5. **MCP Tools** → Fetch docs, search examples as needed

**Vibe Mode for Quick Iterations** - For rapid changes:
- Bug fixes discovered during testing
- Small UI adjustments
- Error message improvements
- Performance optimizations
- Documentation updates
- Minor feature updates

This hybrid approach gave me structure for complex features while maintaining velocity for iterative improvements.

### Example 1: Building the Ad Copy Generator (Spec-Driven)

```
1. Created spec: .kiro/specs/generate-ad-copy/
   - requirements.md: 7 user stories, 20+ acceptance criteria
   - design.md: Architecture, schemas, 12 correctness properties
   - tasks.md: 25 implementation tasks

2. Steering docs provided context:
   - fastmcp-integration.md → Tool definition patterns
   - mcp-ui-integration.md → UI component creation
   - agent-tool-patterns.md → Agent service structure

3. Implemented via spec tasks:
   - Worked through each task systematically
   - Kiro generated code following patterns
   - Tests written based on correctness properties

4. Hooks automated:
   - Security scan on each file save
   - MCP-UI docs check when editing UI code
   - Skill suggestions for agent integration

5. MCP tools assisted:
   - context7 for FastMCP documentation
   - mcp-ui-docs for UIResource patterns
   - exa for ad copy best practices research
```

### Example 2: Fixing UI Rendering Bug (Vibe Coding)

```
Me: The missing fields in the ad requirements UI aren't showing 
    the input boxes correctly. #File src/utils/ad-requirements-ui.ts

Kiro: [Analyzed the file, identified CSS issue, fixed the styling]

Me: Perfect, now the buttons need better spacing

Kiro: [Updated button styles with proper margins]
```

This took 2 minutes vs creating a full spec for a minor fix.

---

## Results

### What I Built

- **6 MCP Tools**: parseAdRequirements, conductAdResearch, generateAdCopy, generateAdImages, generateMixedMedia, getCampaign
- **6 Agent Services**: Each tool backed by Claude Agent SDK
- **6 UI Factories**: Interactive mcp-ui components
- **10 Specs**: Full documentation with traceability
- **Property-Based Tests**: Correctness properties validated
- **Next.js Chat Client**: Full chat interface with UIResource rendering
- **Docker Deployment**: Production-ready containers

### Kiro Features Impact

| Feature | Impact |
|---------|--------|
| **Vibe Coding** | 10x faster implementation through conversation |
| **Specs** | Complete traceability, no missed requirements |
| **Steering** | Consistent patterns, reduced repetition |
| **Hooks** | Automated quality checks, context-aware help |
| **MCP** | Extended capabilities, always current docs |

---

## Conclusion

Kiro transformed my development workflow from traditional coding to AI-augmented development. The combination of:

- **Specs** for structured planning
- **Steering** for persistent context
- **Hooks** for automation
- **MCP** for extended capabilities
- **Vibe Coding** for natural interaction

...enabled me to build a complex MCP server with multiple AI agents, interactive UIs, and database persistence in a fraction of the time it would have taken with traditional development.

The key insight: Kiro isn't just an AI assistant - it's a development environment where AI understands your project deeply and assists at every stage from requirements to deployment.
