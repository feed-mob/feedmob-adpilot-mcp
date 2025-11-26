---
inclusion: always
---

# Testing Strategy

## Overview

This project uses **Vitest** for unit and integration testing, and **fast-check** for property-based testing. All tests should be written in TypeScript and follow the patterns outlined in this document.

## Testing Framework: Vitest

### Why Vitest?

- Fast execution with native ESM support
- Compatible with Jest API (easy migration)
- Built-in TypeScript support
- Excellent watch mode
- Coverage reporting with c8

### Installation

```bash
npm install -D vitest @vitest/coverage-v8
```

### Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.test.ts']
    }
  }
});
```

## Unit Testing

### Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('CampaignService', () => {
  let service: CampaignService;
  
  beforeEach(() => {
    service = new CampaignService();
  });
  
  afterEach(() => {
    // Cleanup
  });
  
  it('should extract budget from campaign request', () => {
    const request = 'I want to run a campaign with $5,000 budget';
    const result = service.extractBudget(request);
    
    expect(result).toEqual({
      amount: 5000,
      currency: 'USD'
    });
  });
});
```

### Mocking

#### Mock Functions

```typescript
import { vi } from 'vitest';

const mockClaudeAPI = vi.fn();
mockClaudeAPI.mockResolvedValue({ parameters: { budget: 5000 } });

// Use in test
const result = await service.extractParameters(request, mockClaudeAPI);
```

#### Mock Modules

```typescript
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ text: '{"budget": 5000}' }]
      })
    }
  }))
}));
```

#### Mock Database

```typescript
import { vi } from 'vitest';

const mockDb = {
  saveCampaign: vi.fn().mockResolvedValue('campaign-123'),
  getCampaign: vi.fn().mockResolvedValue({
    id: 'campaign-123',
    budget: { amount: 5000, currency: 'USD' }
  })
};
```

### Testing FastMCP Tools

```typescript
import { describe, it, expect } from 'vitest';

describe('parseCampaignRequest tool', () => {
  it('should extract campaign parameters', async () => {
    const mockContext = {
      user: { 
        userId: 'test-user', 
        email: 'test@example.com', 
        name: 'Test User' 
      },
      sessionId: 'test-session'
    };
    
    const args = {
      requestText: 'I want to run a TikTok campaign with $5000 budget targeting Gen Z'
    };
    
    const result = await parseCampaignRequestTool.execute(args, mockContext);
    
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('resource');
    expect(result.content[0].resource.uri).toMatch(/^ui:\/\/campaign-params\//);
  });
  
  it('should handle missing budget gracefully', async () => {
    const mockContext = {
      user: { userId: 'test-user', email: 'test@example.com', name: 'Test' },
      sessionId: 'test-session'
    };
    
    const args = {
      requestText: 'I want to run a TikTok campaign'
    };
    
    await expect(
      parseCampaignRequestTool.execute(args, mockContext)
    ).rejects.toThrow('Budget information is required');
  });
});
```

### Testing UIResource Generation

```typescript
import { describe, it, expect } from 'vitest';
import { createUIResource } from '@mcp-ui/server';

describe('UIResourceGenerator', () => {
  it('should create valid parameter display UIResource', () => {
    const params = {
      id: 'campaign-123',
      userId: 'user-456',
      targetAudience: { demographics: ['Gen Z'], ageRange: [18, 24] },
      budget: { amount: 5000, currency: 'USD' },
      platform: { name: 'TikTok', format: 'video' },
      kpis: ['CTR', 'installs']
    };
    
    const uiResource = createParameterDisplay(params);
    
    expect(uiResource.type).toBe('resource');
    expect(uiResource.resource.uri).toBe('ui://campaign-params/campaign-123');
    expect(uiResource.resource.mimeType).toBe('text/html');
    expect(uiResource.resource.text).toContain('Campaign Parameters');
    expect(uiResource.resource.text).toContain('$5,000 USD');
  });
  
  it('should include interactive buttons in UIResource', () => {
    const params = { /* ... */ };
    const uiResource = createParameterDisplay(params);
    
    expect(uiResource.resource.text).toContain('window.parent.postMessage');
    expect(uiResource.resource.text).toContain('confirmParameters');
  });
});
```

## Property-Based Testing

### Framework: fast-check

Property-based testing generates random inputs to verify properties hold for all valid inputs.

### Installation

```bash
npm install -D fast-check
```

### Basic Property Test

```typescript
import fc from 'fast-check';
import { describe, it } from 'vitest';

// Feature: feedmob-adpilot-mcp, Property 1: Text input acceptance
describe('Property 1: Text input acceptance', () => {
  it('should accept any text input without errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 1000 }),
        async (requestText) => {
          // Should not throw
          await expect(
            parseCampaignRequest(requestText)
          ).resolves.toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Custom Arbitraries

Create custom generators for domain objects:

```typescript
// arbitraries/campaign.ts
import fc from 'fast-check';

export const budgetArbitrary = () => fc.record({
  amount: fc.integer({ min: 100, max: 1000000 }),
  currency: fc.constantFrom('USD', 'EUR', 'GBP', 'JPY')
});

export const platformArbitrary = () => fc.record({
  name: fc.constantFrom('TikTok', 'Facebook', 'Instagram', 'Twitter'),
  format: fc.constantFrom('video', 'image', 'carousel', 'story')
});

export const campaignParametersArbitrary = () => fc.record({
  id: fc.uuid(),
  userId: fc.uuid(),
  targetAudience: fc.record({
    demographics: fc.array(fc.string(), { minLength: 1, maxLength: 5 }),
    ageRange: fc.tuple(
      fc.integer({ min: 13, max: 65 }),
      fc.integer({ min: 13, max: 65 })
    ).map(([min, max]) => [Math.min(min, max), Math.max(min, max)] as [number, number])
  }),
  budget: budgetArbitrary(),
  platform: platformArbitrary(),
  kpis: fc.array(
    fc.constantFrom('CTR', 'installs', 'conversions', 'engagement'),
    { minLength: 1, maxLength: 4 }
  ),
  createdAt: fc.date(),
  updatedAt: fc.date()
});
```

### Round-Trip Property Tests

```typescript
// Feature: feedmob-adpilot-mcp, Property 26: Campaign persistence round-trip
describe('Property 26: Campaign persistence round-trip', () => {
  it('should retrieve equivalent campaign data after storage', async () => {
    await fc.assert(
      fc.asyncProperty(
        campaignParametersArbitrary(),
        async (params) => {
          const campaignId = await db.saveCampaign(params.userId, params);
          const retrieved = await db.getCampaign(campaignId);
          
          expect(retrieved.budget).toEqual(params.budget);
          expect(retrieved.platform).toEqual(params.platform);
          expect(retrieved.kpis).toEqual(params.kpis);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Validation Property Tests

```typescript
// Feature: feedmob-adpilot-mcp, Property 31: Budget validation
describe('Property 31: Budget validation', () => {
  it('should reject budgets below platform minimum', async () => {
    await fc.assert(
      fc.asyncProperty(
        platformArbitrary(),
        fc.integer({ min: 1, max: 99 }), // Below minimum
        async (platform, lowBudget) => {
          const params = {
            budget: { amount: lowBudget, currency: 'USD' },
            platform
          };
          
          await expect(
            validateCampaign(params)
          ).rejects.toThrow(/minimum budget/i);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### UIResource Property Tests

```typescript
// Feature: feedmob-adpilot-mcp, Property 8: UIResource generation for parameters
describe('Property 8: UIResource generation for parameters', () => {
  it('should generate valid UIResource with ui:// URI for any campaign parameters', async () => {
    await fc.assert(
      fc.asyncProperty(
        campaignParametersArbitrary(),
        async (params) => {
          const uiResource = createParameterDisplay(params);
          
          expect(uiResource.type).toBe('resource');
          expect(uiResource.resource.uri).toMatch(/^ui:\/\//);
          expect(uiResource.resource.mimeType).toBeDefined();
          expect(
            uiResource.resource.text || uiResource.resource.blob
          ).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

## Integration Testing

### Database Integration Tests

```typescript
import { describe, it, beforeAll, afterAll } from 'vitest';
import { Pool } from 'pg';

describe('Database Integration', () => {
  let pool: Pool;
  
  beforeAll(async () => {
    pool = new Pool({
      connectionString: process.env.TEST_DATABASE_URL
    });
    
    // Run migrations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL,
        data JSONB NOT NULL
      )
    `);
  });
  
  afterAll(async () => {
    await pool.query('DROP TABLE IF EXISTS campaigns');
    await pool.end();
  });
  
  it('should save and retrieve campaign', async () => {
    const campaign = { /* ... */ };
    const id = await db.saveCampaign('user-123', campaign);
    const retrieved = await db.getCampaign(id);
    
    expect(retrieved).toMatchObject(campaign);
  });
});
```

### API Integration Tests

```typescript
import { describe, it, beforeAll, afterAll } from 'vitest';
import Anthropic from '@anthropic-ai/sdk';

describe('Claude API Integration', () => {
  let client: Anthropic;
  
  beforeAll(() => {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  });
  
  it('should extract campaign parameters from text', async () => {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: 'Extract campaign parameters: I want a TikTok campaign with $5000 budget'
      }]
    });
    
    expect(response.content[0].type).toBe('text');
    // Parse and validate response
  });
});
```

## Test Coverage

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test src/services/campaign.test.ts
```

### Coverage Goals

- **Unit Tests**: 80% code coverage minimum
- **Property Tests**: 100 runs per property minimum
- **Integration Tests**: Cover all critical paths

### Coverage Report

```bash
npm run test:coverage
```

View HTML report at `coverage/index.html`

## Best Practices

1. **Test Naming**: Use descriptive names that explain what is being tested
   ```typescript
   // Good
   it('should extract budget amount and currency from natural language')
   
   // Bad
   it('test budget extraction')
   ```

2. **Arrange-Act-Assert**: Structure tests clearly
   ```typescript
   it('should create campaign', async () => {
     // Arrange
     const params = { /* ... */ };
     
     // Act
     const result = await createCampaign(params);
     
     // Assert
     expect(result.id).toBeDefined();
   });
   ```

3. **Test One Thing**: Each test should verify one behavior
   ```typescript
   // Good - separate tests
   it('should extract budget amount')
   it('should extract budget currency')
   
   // Bad - testing multiple things
   it('should extract budget and platform and KPIs')
   ```

4. **Use Meaningful Assertions**: Be specific about what you're testing
   ```typescript
   // Good
   expect(result.budget.amount).toBe(5000);
   expect(result.budget.currency).toBe('USD');
   
   // Bad
   expect(result).toBeDefined();
   ```

5. **Property Test Tagging**: Always tag property tests with feature and property number
   ```typescript
   // Feature: feedmob-adpilot-mcp, Property 26: Campaign persistence round-trip
   describe('Property 26: Campaign persistence round-trip', () => {
     // test implementation
   });
   ```

6. **Mock External Dependencies**: Don't make real API calls in unit tests
   ```typescript
   vi.mock('@anthropic-ai/sdk');
   vi.mock('./database');
   ```

7. **Clean Up**: Always clean up resources in afterEach/afterAll
   ```typescript
   afterEach(async () => {
     await db.cleanup();
     vi.clearAllMocks();
   });
   ```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [fast-check Documentation](https://fast-check.dev/)
- [Testing Best Practices](https://testingjavascript.com/)
