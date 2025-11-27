---
inclusion: always
---

# Claude Agent Skills Development Guide

This guide provides comprehensive instructions for creating Claude Agent skills in the `src/plugins/` directory. Skills are modular packages that extend Claude's capabilities with specialized knowledge, workflows, and tools for use with the Claude Agent SDK.

## Quick Reference

**Plugin Location**: `src/plugins/<plugin-name>/`
**Marketplace Config**: `src/plugins/.claude-plugin/marketplace.json`
**Skill Structure**: `src/plugins/<plugin-name>/skills/<skill-name>/SKILL.md`

## What Are Skills?

Skills are self-contained packages that transform Claude from a general-purpose agent into a specialized agent with domain-specific knowledge. They provide:

1. **Specialized workflows** - Multi-step procedures for specific domains
2. **Tool integrations** - Instructions for working with specific formats or APIs
3. **Domain expertise** - Company-specific knowledge, schemas, business logic
4. **Bundled resources** - Scripts, references, and assets for complex tasks

## Core Principles

### 1. Concise is Key

The context window is shared. Only add context Claude doesn't already have. Challenge each piece of information: "Does Claude really need this?" and "Does this justify its token cost?"

**Default assumption: Claude is already very smart.**

### 2. Set Appropriate Degrees of Freedom

- **High freedom (text instructions)**: Multiple valid approaches, context-dependent decisions
- **Medium freedom (pseudocode with parameters)**: Preferred patterns with acceptable variation
- **Low freedom (specific scripts)**: Fragile operations requiring consistency

### 3. Progressive Disclosure

Skills use three-level loading:
1. **Metadata** (name + description) - Always in context (~100 words)
2. **SKILL.md body** - When skill triggers (<5k words, ideally <500 lines)
3. **Bundled resources** - As needed by Claude

## Skill Anatomy

```
src/plugins/<plugin-name>/
├── skills/
│   └── <skill-name>/
│       ├── SKILL.md (required)
│       ├── scripts/ (optional)
│       │   └── *.py, *.sh, *.js
│       ├── references/ (optional)
│       │   └── *.md
│       └── assets/ (optional)
│           └── templates, images, etc.
```

### SKILL.md (Required)

Every SKILL.md consists of:

**Frontmatter (YAML)**:
```yaml
---
name: skill-name
description: Comprehensive description of what the skill does and when to use it. Include all triggering contexts here.
---
```

**Body (Markdown)**:
- Instructions and guidance for using the skill
- Only loaded AFTER the skill triggers
- Keep under 500 lines when possible

### Bundled Resources (Optional)

#### scripts/

Executable code for deterministic reliability or repeatedly rewritten tasks.

**When to include**: Same code being rewritten repeatedly or deterministic reliability needed

**Examples**:
- `scripts/rotate_pdf.py` - PDF rotation
- `scripts/validate_schema.js` - Schema validation
- `scripts/process_data.py` - Data transformation

**Benefits**: Token efficient, deterministic, may execute without loading into context

#### references/

Documentation and reference material loaded as needed into context.

**When to include**: Documentation Claude should reference while working

**Examples**:
- `references/schema.md` - Database schemas
- `references/api_docs.md` - API specifications
- `references/policies.md` - Company policies
- `references/examples.md` - Common patterns

**Best practice**: If files are large (>10k words), include grep search patterns in SKILL.md

**Avoid duplication**: Information should live in either SKILL.md or references, not both

#### assets/

Files used in output, not loaded into context.

**When to include**: Files that will be used in final output

**Examples**:
- `assets/logo.png` - Brand assets
- `assets/template.html` - HTML templates
- `assets/boilerplate/` - Code boilerplate

**Use cases**: Templates, images, icons, boilerplate code, fonts

## Creating a New Skill

### Step 0: Use the Skill Creator Tool (Recommended)

For guidance on creating effective skills, you can use the MCP skill-creator tool:

```
Use the skill-creator tool from the agent-skills MCP server
```

This tool provides:
- Best practices for skill design
- Step-by-step creation process
- Writing guidelines and patterns
- Progressive disclosure strategies
- Validation and packaging instructions

The skill-creator tool is especially helpful when you're new to creating skills or need a refresher on best practices.

### Step 1: Understand the Skill with Concrete Examples

Ask questions to understand usage patterns:
- "What functionality should this skill support?"
- "Can you give examples of how this skill would be used?"
- "What would a user say that should trigger this skill?"

### Step 2: Plan Reusable Skill Contents

Analyze each example to identify:
1. What scripts would avoid rewriting the same code?
2. What references would provide helpful documentation?
3. What assets would be used in the output?

### Step 3: Create the Plugin Structure

Create the directory structure:

```bash
mkdir -p src/plugins/<plugin-name>/skills/<skill-name>
```

For example, for a "generate-ad-copy" skill:

```bash
mkdir -p src/plugins/generate-ad-copy/skills/generate-ad-copy
```

### Step 4: Create SKILL.md

Create `src/plugins/<plugin-name>/skills/<skill-name>/SKILL.md`:

```markdown
---
name: skill-name
description: Comprehensive description including what the skill does and all triggering contexts. Use when Claude needs to [specific use cases]. Supports: (1) [feature 1], (2) [feature 2], (3) [feature 3].
---

# Skill Name

## Overview

Brief overview of what the skill does.

## When to Use This Skill

Use this skill when:
- [Specific scenario 1]
- [Specific scenario 2]
- [Specific scenario 3]

## Workflow

### Step 1: [First Step]

Detailed instructions for the first step.

### Step 2: [Second Step]

Detailed instructions for the second step.

### Step 3: [Output]

Describe the expected output format.

## Examples

### Example 1: [Scenario Name]

**Input**: "Example input"

**Output**:
```json
{
  "example": "output"
}
```

### Example 2: [Another Scenario]

**Input**: "Another example"

**Output**:
```json
{
  "another": "example"
}
```

## Important Notes

- Key consideration 1
- Key consideration 2
- Key consideration 3
```

### Step 5: Add Bundled Resources (Optional)

Create directories as needed:

```bash
# For scripts
mkdir -p src/plugins/<plugin-name>/skills/<skill-name>/scripts

# For references
mkdir -p src/plugins/<plugin-name>/skills/<skill-name>/references

# For assets
mkdir -p src/plugins/<plugin-name>/skills/<skill-name>/assets
```

Add your files to the appropriate directories.

### Step 6: Update Marketplace Configuration

Edit `src/plugins/.claude-plugin/marketplace.json` to register your plugin:

```json
{
  "name": "feedmob-claude-plugins",
  "owner": {
    "name": "FeedMob Inc.",
    "email": "dev@feedmob.com",
    "url": "https://feedmob.com"
  },
  "plugins": [
    {
      "name": "your-plugin-name",
      "source": "./your-plugin-name",
      "version": "1.0.0",
      "description": "Brief description of your plugin",
      "author": "FeedMob",
      "skills": [
        "./skills/your-skill-name/SKILL.md"
      ]
    }
  ]
}
```

**Important**: Add your plugin to the `plugins` array, don't replace existing plugins.

## Using Skills in Agent Services

Once your skill is created, use it in an agent service following the agent-tool-patterns.md guide.

### Agent Service Integration

In `src/services/your-agent.ts`:

```typescript
import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { query, type SDKMessage, type SDKResultMessage } from '@anthropic-ai/claude-agent-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class YourAgent {
  async processInput(inputText: string): Promise<Result> {
    try {
      const pluginPath = this.resolvePluginPath();
      
      // Reference your skill in the prompt
      const prompt = `Use the "your-skill-name" skill to process:

"${inputText}"

Return a JSON object with the results.`;

      // Run agent with plugin
      for await (const message of query({
        prompt,
        options: {
          plugins: [{ type: 'local', path: pluginPath }],
          allowedTools: ['Skill', 'Read'],
          maxTurns: 10,
        }
      })) {
        // Process messages...
      }
      
      // Parse and return result...
    } catch (error) {
      throw new Error(`Failed to process: ${error.message}`);
    }
  }

  private resolvePluginPath(): string {
    // Point to your plugin directory
    const pluginPath = resolve(__dirname, '..', 'plugins', 'your-plugin-name');
    
    if (existsSync(pluginPath)) {
      const manifestPath = resolve(pluginPath, 'skills', 'your-skill-name', 'SKILL.md');
      if (existsSync(manifestPath)) {
        console.log(`✅ Found plugin at: ${pluginPath}`);
        return pluginPath;
      }
    }

    throw new Error(
      `Plugin not found at: ${pluginPath}. Expected: src/plugins/your-plugin-name/skills/your-skill-name/SKILL.md`
    );
  }
}
```

## Writing Effective SKILL.md

### Frontmatter Guidelines

**name**: The skill name (kebab-case)

**description**: This is the PRIMARY triggering mechanism
- Include both what the skill does AND when to use it
- Include all "when to use" information here (not in body)
- The body is only loaded after triggering
- Be comprehensive and specific

**Example**:
```yaml
---
name: parse-ad-requirements
description: Extract structured advertising campaign parameters from natural language input provided by advertisers. This skill should be used when analyzing advertising requirements, campaign briefs, or ad requests that need to be converted into structured data. Identifies missing information and provides helpful guidance for completing campaign requirements.
---
```

### Body Guidelines

**Writing Style**: Always use imperative/infinitive form

**Structure**:
1. **Overview** - Brief summary
2. **When to Use This Skill** - Specific scenarios (bullet list)
3. **Workflow** - Step-by-step instructions
4. **Examples** - 2-3 concrete examples with input/output
5. **Important Notes** - Key considerations

**Keep it concise**:
- Under 500 lines when possible
- Split into references/ files if longer
- Reference external files clearly

### Progressive Disclosure Patterns

**Pattern 1: High-level guide with references**

```markdown
# PDF Processing

## Quick start

Extract text with pdfplumber:
[code example]

## Advanced features

- **Form filling**: See [references/forms.md](references/forms.md)
- **API reference**: See [references/api.md](references/api.md)
- **Examples**: See [references/examples.md](references/examples.md)
```

**Pattern 2: Domain-specific organization**

```markdown
# BigQuery Skill

## Overview

Query and analyze data across multiple domains.

## Domain References

- **Finance**: See [references/finance.md](references/finance.md)
- **Sales**: See [references/sales.md](references/sales.md)
- **Product**: See [references/product.md](references/product.md)
```

**Pattern 3: Framework-specific organization**

```markdown
# Cloud Deploy

## Workflow

1. Choose your cloud provider
2. See provider-specific guide:
   - **AWS**: [references/aws.md](references/aws.md)
   - **GCP**: [references/gcp.md](references/gcp.md)
   - **Azure**: [references/azure.md](references/azure.md)
```

## Best Practices

### DO

✅ Use imperative form in instructions
✅ Include concrete examples with input/output
✅ Keep SKILL.md under 500 lines
✅ Split large content into references/
✅ Reference bundled resources clearly
✅ Test scripts before including them
✅ Use semantic naming (kebab-case)
✅ Include all triggering contexts in description
✅ Provide helpful suggestions for missing information
✅ Return structured, parseable output (JSON)

### DON'T

❌ Create README.md or other auxiliary docs
❌ Include setup/testing procedures in SKILL.md
❌ Duplicate information between SKILL.md and references
❌ Use deeply nested references (keep one level)
❌ Include "when to use" sections in body (put in description)
❌ Assume Claude needs basic explanations
❌ Create extraneous documentation files
❌ Include user-facing documentation

## Example: Complete Skill Structure

```
src/plugins/generate-ad-copy/
└── skills/
    └── generate-ad-copy/
        ├── SKILL.md
        ├── scripts/
        │   ├── validate_copy.py
        │   └── format_output.js
        ├── references/
        │   ├── brand_guidelines.md
        │   ├── tone_examples.md
        │   └── platform_specs.md
        └── assets/
            ├── templates/
            │   ├── tiktok_template.txt
            │   └── facebook_template.txt
            └── examples/
                └── successful_campaigns.json
```

## Testing Your Skill

### 1. Verify Structure

Check that all required files exist:

```bash
# Check SKILL.md exists
ls src/plugins/<plugin-name>/skills/<skill-name>/SKILL.md

# Check marketplace.json is updated
cat src/plugins/.claude-plugin/marketplace.json
```

### 2. Test with Agent Service

Create an agent service that uses your skill (see agent-tool-patterns.md):

```typescript
// src/services/your-agent.ts
export class YourAgent {
  async processInput(inputText: string): Promise<Result> {
    const pluginPath = this.resolvePluginPath();
    // Use your skill...
  }
}
```

### 3. Test with MCP Tool

Create an MCP tool that calls your agent service:

```typescript
// src/tools/your-tool.ts
export const yourTool = {
  name: 'yourToolName',
  description: 'Description',
  parameters: InputSchema,
  execute: async (args) => {
    const result = await yourAgent.processInput(args.inputText);
    return { content: [createResultUI(result)] };
  }
};
```

### 4. Test with MCP Inspector

```bash
npm run mcp:inspect
```

Test your tool in the MCP Inspector to verify:
- Skill triggers correctly
- Output format is correct
- Error handling works
- UI renders properly

## Common Patterns

### Pattern 1: Extraction and Validation

For skills that extract structured data from natural language:

```markdown
## Workflow

### Step 1: Extract Parameters

Analyze input and extract fields:
1. field1 - Description
2. field2 - Description

### Step 2: Identify Missing Fields

Mark fields as missing if not present or unclear.

### Step 3: Return Structured Output

```json
{
  "success": true/false,
  "data": { ... },
  "missingFields": [...],
  "suggestions": { ... }
}
```
```

### Pattern 2: Generation with Templates

For skills that generate content:

```markdown
## Workflow

### Step 1: Analyze Requirements

Understand the requirements from input.

### Step 2: Select Template

Choose appropriate template from assets/:
- Template A for scenario X
- Template B for scenario Y

### Step 3: Generate Content

Fill template with extracted information.

### Step 4: Validate Output

Check against requirements and constraints.
```

### Pattern 3: Multi-Step Processing

For skills with complex workflows:

```markdown
## Workflow

### Step 1: Preparation

Prepare input data and validate.

### Step 2: Processing

Execute main processing logic.
See [references/processing.md](references/processing.md) for details.

### Step 3: Post-Processing

Clean and format output.

### Step 4: Validation

Verify output meets requirements.
```

## Troubleshooting

### Skill Not Triggering

**Problem**: Agent doesn't use your skill

**Solutions**:
1. Check description in frontmatter includes triggering contexts
2. Verify marketplace.json includes your skill
3. Ensure plugin path is correct in agent service
4. Check SKILL.md exists at expected location

### Plugin Not Found

**Problem**: `Plugin not found at: ...`

**Solutions**:
1. Verify directory structure matches expected path
2. Check SKILL.md exists in skills/<skill-name>/
3. Ensure marketplace.json has correct source path
4. Verify resolvePluginPath() points to correct directory

### Skill Loaded But Not Working

**Problem**: Skill triggers but produces wrong output

**Solutions**:
1. Review examples in SKILL.md for clarity
2. Check workflow instructions are specific enough
3. Verify output format matches schema expectations
4. Test with simpler inputs first

### Context Window Issues

**Problem**: Skill uses too much context

**Solutions**:
1. Move detailed content to references/
2. Keep SKILL.md under 500 lines
3. Use progressive disclosure patterns
4. Remove unnecessary explanations

## Checklist for New Skills

- [ ] Create plugin directory structure
- [ ] Write SKILL.md with frontmatter and body
- [ ] Add bundled resources (scripts, references, assets)
- [ ] Update marketplace.json
- [ ] Create agent service that uses the skill
- [ ] Create MCP tool that calls the agent
- [ ] Create schemas for input/output validation
- [ ] Create UI factory for result display
- [ ] Write property-based tests
- [ ] Test with MCP Inspector
- [ ] Verify type safety with typecheck
- [ ] Document in docs/ if needed

## MCP Tools for Skill Development

### skill-creator Tool

Access comprehensive skill creation guidance using the MCP tool:

**Tool**: `get_skill_skill-creator`  
**Server**: `agent-skills`  
**Type**: `tool`

This tool provides the complete skill creation guide including:
- Understanding skills with concrete examples
- Planning reusable skill contents
- Initializing skill structure
- Editing SKILL.md effectively
- Packaging and iteration workflows
- Progressive disclosure patterns
- Best practices and common pitfalls

**Usage in Kiro**:
```
Use the skill-creator tool to get guidance on creating a new skill
```

The tool returns detailed documentation that complements this guide with additional context about the skill creation philosophy and advanced patterns.

## References

- [Agent Tool Patterns](.kiro/steering/agent-tool-patterns.md) - How to use skills in agent services
- [FastMCP Integration](.kiro/steering/fastmcp-integration.md) - MCP tool creation
- [MCP-UI Integration](.kiro/steering/mcp-ui-integration.md) - UI resource generation
- [Technology Stack](.kiro/steering/tech.md) - Project tech stack
- [Repository Guidelines](../AGENTS.md) - General guidelines
- **MCP skill-creator tool** - Comprehensive skill creation guide (use `get_skill_skill-creator`)
