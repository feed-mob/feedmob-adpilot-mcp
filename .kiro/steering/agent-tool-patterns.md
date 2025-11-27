---
inclusion: always
---

# Agent-Based Tool Development Patterns

This guide documents the architectural patterns, conventions, and best practices for building MCP tools that integrate with Claude Agent SDK for complex NLP tasks. Use this as a reference when creating similar agent-powered tools.

## Architecture Overview

Agent-based tools follow a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│  MCP Tool (FastMCP)                     │  ← Tool definition, parameter validation
│  src/tools/parse-ad-requirements.ts     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Agent Service                          │  ← Claude Agent SDK integration
│  src/services/ad-requirements-agent.ts  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  UI Factory                             │  ← UIResource generation
│  src/utils/ad-requirements-ui.ts        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Schemas (Zod)                          │  ← Type safety & validation
│  src/schemas/campaign-params.ts         │
└─────────────────────────────────────────┘
```

## File Organization

### 1. Tool Definition (`src/tools/*.ts`)

**Purpose**: FastMCP tool configuration, input validation, orchestration

**Responsibilities**:
- Define tool name, description, and parameters (Zod schema)
- Validate input using Zod schemas
- Call agent service to perform NLP extraction
- Handle errors and categorize them (validation, agent, timeout, unknown)
- Generate both text summaries (for LLM) and UIResources (for user)
- Return structured MCP response with content array

**Pattern**:
```typescript
import { z } from 'zod';
import { InputSchema } from '../schemas/your-schema.js';
import { yourAgent } from '../services/your-agent.js';
import { createResultUI, createErrorUI } from '../utils/your-ui.js';

export const yourTool = {
  name: 'yourToolName',
  description: 'Clear description of what the tool does',
  parameters: InputSchema,
  execute: async (args: z.infer<typeof InputSchema>) => {
    try {
      // 1. Validate input
      const validated = InputSchema.parse(args);
      
      // 2. Call agent service
      const result = await yourAgent.processInput(validated.inputText);
      
      // 3. Generate UI
      const uiResource = createResultUI(result);
      
      // 4. Create text summary for LLM
      const textSummary = `Summary of results...`;
      
      // 5. Return both text and UI
      return {
        content: [
          { type: 'text', text: textSummary },
          uiResource
        ]
      };
    } catch (error) {
      // Categorize error type
      let errorType: 'validation' | 'agent' | 'timeout' | 'unknown' = 'unknown';
      
      if (error instanceof z.ZodError) {
        errorType = 'validation';
      } else if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorType = 'timeout';
        } else if (error.message.includes('agent-specific-error')) {
          errorType = 'agent';
        }
      }
      
      // Generate error UI
      const errorUI = createErrorUI(
        error instanceof Error ? error : new Error('Unknown error'),
        errorType
      );
      
      return {
        content: [
          { type: 'text', text: `Error: ${error.message}` },
          errorUI
        ]
      };
    }
  }
};
```

### 2. Agent Service (`src/services/*-agent.ts`)

**Purpose**: Claude Agent SDK integration, plugin management, response parsing

**Responsibilities**:
- Manage Claude Agent SDK lifecycle
- Resolve plugin paths (with fallback to embedded mode)
- Construct prompts for the agent
- Stream and collect agent responses
- Parse JSON from agent output
- Validate responses against schemas
- Handle agent-specific errors

**Pattern**:
```typescript
import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { query, type SDKMessage, type SDKResultMessage } from '@anthropic-ai/claude-agent-sdk';
import { ResultSchema, type Result } from '../schemas/your-schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class YourAgent {
  /**
   * Process input using Claude Agent SDK
   */
  async processInput(inputText: string): Promise<Result> {
    try {
      const pluginPath = this.resolvePluginPath();
      
      // Construct prompt
      const prompt = `Use the "your-skill" skill to process:

"${inputText}"

Return a JSON object with the results.`;

      const assistantSnippets: string[] = [];
      let resultMessage: SDKResultMessage | undefined;

      // Run agent with plugin
      for await (const message of query({
        prompt,
        options: {
          plugins: [{ type: 'local', path: pluginPath }],
          allowedTools: ['Skill', 'Read'],
          maxTurns: 10,
        }
      })) {
        if (message.type === 'assistant') {
          const text = this.extractAssistantText(message);
          if (text) assistantSnippets.push(text);
        } else if (message.type === 'result') {
          resultMessage = message;
        }
      }

      // Validate result
      if (!resultMessage) {
        throw new Error('Agent returned no result');
      }

      if (resultMessage.subtype !== 'success') {
        const reason = Array.isArray(resultMessage.errors) && resultMessage.errors.length
          ? resultMessage.errors.join('; ')
          : `subtype ${resultMessage.subtype}`;
        throw new Error(`Agent run failed: ${reason}`);
      }

      // Extract and parse JSON
      const responseText = (resultMessage.result || assistantSnippets.join('\n')).trim();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No JSON found in agent response');
      }

      const parsedResult = JSON.parse(jsonMatch[0]);
      const validatedResult = ResultSchema.parse(parsedResult);
      
      return validatedResult;
    } catch (error) {
      console.error('Error in agent:', error);
      throw new Error(`Failed to process: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text from assistant messages
   */
  private extractAssistantText(message: Extract<SDKMessage, { type: 'assistant' }>): string {
    const assistantMessage = message.message as any;
    const content = Array.isArray(assistantMessage?.content) ? assistantMessage.content : [];
    const textParts: string[] = [];

    for (const block of content) {
      if (typeof block === 'string') {
        textParts.push(block);
        continue;
      }

      if (block?.type === 'text' && typeof block.text === 'string') {
        textParts.push(block.text);
        continue;
      }

      if (block?.type === 'tool_result' && Array.isArray(block.content)) {
        for (const nested of block.content) {
          if (typeof nested === 'string') {
            textParts.push(nested);
          } else if (nested?.type === 'text' && typeof nested.text === 'string') {
            textParts.push(nested.text);
          }
        }
      }
    }

    return textParts.join('\n').trim();
  }

  /**
   * Resolve plugin path with validation
   */
  private resolvePluginPath(): string {
    const pluginPath = resolve(__dirname, '..', 'plugins', 'your-plugin');
    
    if (existsSync(pluginPath)) {
      const manifestPath = resolve(pluginPath, 'skills', 'your-skill', 'SKILL.md');
      if (existsSync(manifestPath)) {
        console.log(`✅ Found plugin at: ${pluginPath}`);
        return pluginPath;
      }
    }

    throw new Error(
      `Plugin not found at: ${pluginPath}. Expected: src/plugins/your-plugin/skills/your-skill/SKILL.md`
    );
  }
}

// Singleton export
export const yourAgent = new YourAgent();
```

### 3. UI Factory (`src/utils/*-ui.ts`)

**Purpose**: Generate interactive UIResources using mcp-ui

**Responsibilities**:
- Create UIResources with semantic URIs
- Generate HTML with inline CSS (design system variables)
- Implement interactive elements (buttons, forms, inputs)
- Handle missing/incomplete data states
- Provide error UIs for different error types
- Use postMessage for tool calls, prompts, notifications

**Design System Variables** (always include):
```css
:root {
  --bg-primary: #f5f5f5;
  --bg-secondary: #ededed;
  --bg-tertiary: #e6e6e6;
  --text-primary: #111;
  --text-secondary: #444;
  --text-tertiary: #666;
  --icon-primary: #111;
  --accent-blue: #0078ff;
  --accent-orange: #ff9500;
  --accent-green: #0d9b45;
  --accent-red: #ff3b30;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #0f0f10;
    --bg-secondary: #1a1b1d;
    --bg-tertiary: #242529;
    --text-primary: #f5f5f5;
    --text-secondary: #c8c8cc;
    --text-tertiary: #9a9aa0;
    --icon-primary: #f5f5f5;
  }
}
```

**Pattern for Result UI**:
```typescript
import { createUIResource } from '@mcp-ui/server';
import { Result } from '../schemas/your-schema.js';

export function createResultUI(result: Result) {
  const htmlContent = `
    <style>
      /* Include design system variables */
      :root { ... }
      @media (prefers-color-scheme: dark) { ... }
      
      /* Component styles */
      .container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        padding: 30px;
        background: var(--bg-secondary);
        border-radius: 12px;
        max-width: 800px;
        margin: 0 auto;
        color: var(--text-primary);
      }
      /* ... more styles ... */
    </style>
    <div class="container">
      <!-- Your UI content -->
      <button onclick="handleAction()">Action</button>
    </div>
    <script>
      function handleAction() {
        window.parent.postMessage({
          type: 'tool',
          payload: {
            toolName: 'nextTool',
            params: { data: 'value' }
          }
        }, '*');
      }
    </script>
  `;

  return createUIResource({
    uri: `ui://your-resource/${Date.now()}`,
    content: { type: 'rawHtml', htmlString: htmlContent },
    encoding: 'text',
    metadata: {
      title: 'Result Title',
      description: 'Result description'
    }
  });
}
```

**Pattern for Error UI**:
```typescript
export function createErrorUI(
  error: Error,
  errorType: 'validation' | 'agent' | 'timeout' | 'unknown' = 'unknown'
) {
  const errorMessages = {
    validation: {
      title: 'Invalid Input',
      message: 'The input could not be validated.',
      icon: '⚠️'
    },
    agent: {
      title: 'Processing Error',
      message: 'We encountered an issue processing your request.',
      icon: '❌'
    },
    timeout: {
      title: 'Request Timeout',
      message: 'The request took too long to process.',
      icon: '⏱️'
    },
    unknown: {
      title: 'Unexpected Error',
      message: 'An unexpected error occurred.',
      icon: '🔴'
    }
  };

  const errorInfo = errorMessages[errorType];

  const htmlContent = `
    <style>/* ... error styles ... */</style>
    <div class="error-container">
      <div class="error-icon">${errorInfo.icon}</div>
      <div class="error-title">${errorInfo.title}</div>
      <div class="error-message">${errorInfo.message}</div>
      <div class="error-details">${error.message}</div>
      ${errorType !== 'validation' ? `
        <button class="retry-button" onclick="handleRetry()">Try Again</button>
      ` : ''}
    </div>
    <script>
      function handleRetry() {
        window.parent.postMessage({
          type: 'prompt',
          payload: { prompt: 'Please try again' }
        }, '*');
      }
    </script>
  `;

  return createUIResource({
    uri: `ui://error/${errorType}/${Date.now()}`,
    content: { type: 'rawHtml', htmlString: htmlContent },
    encoding: 'text',
    metadata: {
      title: errorInfo.title,
      description: `Error: ${error.message}`
    }
  });
}
```

### 4. Schemas (`src/schemas/*.ts`)

**Purpose**: Type-safe data structures with runtime validation

**Responsibilities**:
- Define input schemas with validation rules
- Define output/result schemas
- Export TypeScript types from Zod schemas
- Document field purposes and constraints

**Pattern**:
```typescript
import { z } from 'zod';

/**
 * Schema for the main data structure
 * All fields nullable to support incremental extraction
 */
export const DataSchema = z.object({
  field1: z.string().nullable(),
  field2: z.string().url().nullable().or(z.literal(null)),
  field3: z.number().nullable(),
  // ... more fields
});

export type Data = z.infer<typeof DataSchema>;

/**
 * Schema for the result returned by the agent
 */
export const ResultSchema = z.object({
  success: z.boolean(),
  data: DataSchema,
  missingFields: z.array(z.string()),
  suggestions: z.record(z.string()).optional()
});

export type Result = z.infer<typeof ResultSchema>;

/**
 * Schema for tool input with validation
 */
export const InputSchema = z.object({
  inputText: z.string()
    .min(1, 'Input must not be empty')
    .refine(
      (val) => val.trim().length > 0,
      { message: 'Input must contain non-whitespace characters' }
    )
});

export type Input = z.infer<typeof InputSchema>;
```

## Testing Strategy

### Property-Based Tests (`tests/properties/*.property.test.ts`)

Use **fast-check** for property-based testing to validate invariants:

**Test Categories**:

1. **Schema Validation Round-Trip**
   - Serialize to JSON and parse back
   - Validate through schema
   - Should equal original

2. **Input Schema Enforcement**
   - Reject empty strings
   - Reject whitespace-only strings
   - Accept valid inputs
   - Throw ZodError with path information

3. **Output Schema Enforcement**
   - Validate any result through schema
   - Reject results missing required fields

4. **Business Logic Invariants**
   - Example: `success=true iff missingFields.length === 0`
   - Maintain consistency between related fields

5. **UIResource Generation**
   - Generate valid UIResource for any result
   - Include required structural elements
   - Apply design system variables

6. **Visual State Consistency**
   - Missing fields have distinct styling
   - Complete data shows confirmation UI
   - Error states render appropriately

**Pattern**:
```typescript
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { DataSchema, ResultSchema } from '../../src/schemas/your-schema.js';
import { createResultUI } from '../../src/utils/your-ui.js';

// Arbitrary generators
const dataArbitrary = fc.record({
  field1: fc.oneof(fc.string(), fc.constant(null)),
  field2: fc.oneof(fc.webUrl(), fc.constant(null)),
  // ... more fields
});

const resultArbitrary = fc
  .record({
    data: dataArbitrary,
    missingFields: fc.array(fc.string()),
    suggestions: fc.option(fc.dictionary(fc.string(), fc.string()), { nil: undefined })
  })
  .map(({ data, missingFields, suggestions }) => ({
    success: missingFields.length === 0,
    data,
    missingFields,
    suggestions
  }));

describe('Your Tool - Property Tests', () => {
  it('should round-trip through JSON serialization', () => {
    fc.assert(
      fc.property(resultArbitrary, (result) => {
        const json = JSON.stringify(result);
        const parsed = JSON.parse(json);
        const validated = ResultSchema.parse(parsed);
        expect(validated).toEqual(result);
      }),
      { numRuns: 100 }
    );
  });

  it('should generate valid UIResource for any result', () => {
    fc.assert(
      fc.property(resultArbitrary, (result) => {
        const uiResource = createResultUI(result);
        expect(uiResource.resource.uri).toMatch(/^ui:\/\//);
        expect(uiResource.resource.mimeType).toBe('text/html');
        expect(uiResource.resource.text).toBeTruthy();
      }),
      { numRuns: 100 }
    );
  });
});
```

## Plugin Structure

For Claude Agent SDK integration, create a plugin:

```
src/plugins/your-plugin/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
└── skills/
    └── your-skill/
        └── SKILL.md          # Skill definition with instructions
```

**plugin.json**:
```json
{
  "name": "your-plugin",
  "version": "1.0.0",
  "description": "Description of your plugin",
  "skills": ["your-skill"]
}
```

**SKILL.md**:
```markdown
# Your Skill

## Description
Clear description of what the skill does.

## Input Format
Describe expected input format.

## Output Format
Describe expected output format (usually JSON).

## Instructions
Detailed instructions for the agent on how to process the input.

## Examples
Provide 2-3 examples of input/output pairs.
```

## Best Practices

### 1. Error Handling
- **Categorize errors**: validation, agent, timeout, unknown
- **Provide context**: Include error messages in both text and UI
- **Offer recovery**: Retry buttons, prompts for clarification
- **Log errors**: Use `console.error` for debugging

### 2. UI Design
- **Use design system variables**: Consistent theming with dark mode support
- **Semantic URIs**: `ui://resource-type/id/timestamp`
- **Inline everything**: CSS and JavaScript must be inline (sandboxed iframe)
- **Responsive layout**: Use CSS Grid/Flexbox for adaptability
- **Clear visual hierarchy**: Title → Subtitle → Content → Actions

### 3. Interactive Elements
- **Tool calls**: Use `window.parent.postMessage` with `type: 'tool'`
- **Prompts**: Use `type: 'prompt'` for user input
- **Notifications**: Use `type: 'notify'` for feedback
- **Form validation**: Client-side validation before tool calls

### 4. Type Safety
- **Zod everywhere**: Input validation, output validation, type inference
- **Explicit types**: Export TypeScript types from schemas
- **Runtime validation**: Always validate agent responses
- **Null handling**: Use `.nullable()` for optional fields

### 5. Agent Integration
- **Plugin-first**: Try plugin mode, fall back to embedded if needed
- **Clear prompts**: Explicit instructions for the agent
- **JSON extraction**: Use regex to extract JSON from responses
- **Schema validation**: Always validate parsed JSON

### 6. Testing
- **Property-based tests**: Use fast-check for invariants
- **100+ runs**: Default to 100 runs for property tests
- **Edge cases**: Test empty, null, whitespace, invalid data
- **UI validation**: Check for required CSS classes and elements

## Common Patterns

### Editable Fields for Missing Data
```typescript
// In UI factory
const isMissing = missingFields.includes(fieldName);

if (isMissing) {
  return `
    <div class="field missing-field">
      <label for="field-${fieldName}">${label}</label>
      <input 
        type="text" 
        id="field-${fieldName}" 
        name="${fieldName}"
        placeholder="Enter ${label.toLowerCase()}..."
      />
    </div>
  `;
}
```

### Collecting Form Data and Re-calling Tool
```javascript
function handleSubmit() {
  const inputs = document.querySelectorAll('.field-input');
  const updatedFields = {};
  
  inputs.forEach(input => {
    const value = input.value.trim();
    if (value) updatedFields[input.name] = value;
  });

  const requestText = `Updated information: ${JSON.stringify(updatedFields)}`;

  window.parent.postMessage({
    type: 'tool',
    payload: {
      toolName: 'yourTool',
      params: { requestText }
    }
  }, '*');
}
```

### Progress Indication
```typescript
// In tool execute
await context.sendProgress('Extracting parameters...');
const params = await agent.extract(input);

await context.sendProgress('Validating data...');
await validate(params);

return createResultUI(params);
```

## Documentation

Create a documentation file in `docs/` explaining:
- Architecture overview
- Plugin structure and setup
- Environment variables and authentication
- Current status (plugin vs embedded mode)
- Troubleshooting common issues
- Future improvements

## Checklist for New Agent Tools

- [ ] Create schema file with input/output validation
- [ ] Create agent service with Claude SDK integration
- [ ] Create UI factory with result and error UIs
- [ ] Create tool definition with error handling
- [ ] Create plugin structure (if using plugins)
- [ ] Write property-based tests (100+ runs)
- [ ] Add design system CSS variables
- [ ] Implement interactive elements (buttons, forms)
- [ ] Add error categorization and recovery
- [ ] Create documentation file
- [ ] Test with `npm run mcp:inspect`
- [ ] Verify type safety with `npm run typecheck`
- [ ] Run tests with coverage

## References

- [FastMCP Integration Guidelines](.kiro/steering/fastmcp-integration.md)
- [MCP-UI Integration Guidelines](.kiro/steering/mcp-ui-integration.md)
- [Technology Stack](.kiro/steering/tech.md)
- [Repository Guidelines](AGENTS.md)
