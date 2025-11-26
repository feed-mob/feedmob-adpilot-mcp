import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { greetingTool } from '../../src/tools/greeting.js';

describe('Greeting Tool Property Tests', () => {
  // Feature: mcp-ui-fastmcp-demo, Property 1: Non-empty name validation
  it('should reject all whitespace-only strings with validation error', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate strings that are only whitespace
        fc.stringMatching(/^\s+$/),
        async (whitespaceString) => {
          // Attempt to execute the tool with whitespace-only name
          await expect(
            greetingTool.execute({ name: whitespaceString })
          ).rejects.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject empty string with validation error', async () => {
    await expect(
      greetingTool.execute({ name: '' })
    ).rejects.toThrow();
  });

  it('should accept any non-empty, non-whitespace string', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate non-empty strings with at least one non-whitespace character
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        async (validName) => {
          const result = await greetingTool.execute({ name: validName });
          expect(result).toBeDefined();
          expect(result.content).toBeDefined();
          expect(result.content.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
