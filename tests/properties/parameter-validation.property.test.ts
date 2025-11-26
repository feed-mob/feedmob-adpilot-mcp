import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { GreetingSchema } from '../../src/tools/greeting.js';
import { ButtonSchema } from '../../src/tools/button.js';
import { CounterSchema } from '../../src/tools/counter.js';
import { greetingTool } from '../../src/tools/greeting.js';
import { buttonTool } from '../../src/tools/button.js';
import { counterTool } from '../../src/tools/counter.js';

describe('Parameter Validation Property Tests', () => {
  // Feature: mcp-ui-fastmcp-demo, Property 5: Parameter validation enforcement
  
  describe('Greeting Tool Validation', () => {
    it('should reject invalid parameter types before tool execution', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.integer(),
            fc.boolean(),
            fc.array(fc.string()),
            fc.object()
          ),
          (invalidName) => {
            const result = GreetingSchema.safeParse({ name: invalidName });
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject empty strings', () => {
      const result = GreetingSchema.safeParse({ name: '' });
      expect(result.success).toBe(false);
    });

    it('should reject missing name parameter', () => {
      const result = GreetingSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('Button Tool Validation', () => {
    it('should reject invalid action parameter types', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.integer(),
            fc.boolean(),
            fc.array(fc.string())
          ),
          (invalidAction) => {
            const result = ButtonSchema.safeParse({ action: invalidAction });
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject missing action parameter', () => {
      const result = ButtonSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should accept valid action with optional source', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.option(fc.string(), { nil: undefined }),
          (action, source) => {
            const params = source !== undefined ? { action, source } : { action };
            const result = ButtonSchema.safeParse(params);
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Counter Tool Validation', () => {
    it('should reject invalid count parameter types', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.string(),
            fc.boolean(),
            fc.array(fc.integer())
          ),
          (invalidCount) => {
            const result = CounterSchema.safeParse({ count: invalidCount });
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject missing count parameter', () => {
      const result = CounterSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should accept any valid number', () => {
      fc.assert(
        fc.property(
          fc.integer(),
          (count) => {
            const result = CounterSchema.safeParse({ count });
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Tool Execution with Invalid Parameters', () => {
    it('should prevent greeting tool execution with invalid params', async () => {
      await expect(
        greetingTool.execute({ name: 123 as any })
      ).rejects.toThrow();
    });

    it('should prevent button tool execution with invalid params', async () => {
      await expect(
        buttonTool.execute({ action: 123 as any })
      ).rejects.toThrow();
    });

    it('should prevent counter tool execution with invalid params', async () => {
      await expect(
        counterTool.execute({ count: "not a number" as any })
      ).rejects.toThrow();
    });
  });
});
