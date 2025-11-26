import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { counterTool } from '../../src/tools/counter.js';

describe('Counter Tool Property Tests', () => {
  // Feature: mcp-ui-fastmcp-demo, Property 4: Counter state consistency
  it('should return to original value after increment then decrement', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer(),
        async (originalCount) => {
          // Increment
          const incrementedResult = await counterTool.execute({ 
            count: originalCount + 1 
          });
          expect(incrementedResult.content[0].resource.text).toContain(
            String(originalCount + 1)
          );
          
          // Decrement back to original
          const decrementedResult = await counterTool.execute({ 
            count: originalCount 
          });
          expect(decrementedResult.content[0].resource.text).toContain(
            String(originalCount)
          );
          
          // Verify the final count matches original
          const finalHtml = decrementedResult.content[0].resource.text;
          const displayMatch = finalHtml.match(/<div class="counter-display">(-?\d+)<\/div>/);
          expect(displayMatch).toBeTruthy();
          expect(parseInt(displayMatch![1])).toBe(originalCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle negative numbers correctly', async () => {
    const result = await counterTool.execute({ count: -5 });
    expect(result.content[0].resource.text).toContain('-5');
  });

  it('should handle zero correctly', async () => {
    const result = await counterTool.execute({ count: 0 });
    expect(result.content[0].resource.text).toContain('0');
  });

  it('should handle large numbers correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: -1000000, max: 1000000 }),
        async (count) => {
          const result = await counterTool.execute({ count });
          expect(result.content[0].resource.text).toContain(String(count));
        }
      ),
      { numRuns: 100 }
    );
  });
});
