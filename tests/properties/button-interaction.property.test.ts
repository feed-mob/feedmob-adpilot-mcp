import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { buttonTool } from '../../src/tools/button.js';

describe('Button Tool Property Tests', () => {
  // Feature: mcp-ui-fastmcp-demo, Property 3: Button interaction round-trip
  it('should successfully handle any action string and return UIResource', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.option(fc.string(), { nil: undefined }),
        async (action, source) => {
          const params = source !== undefined 
            ? { action, source } 
            : { action };
          
          const result = await buttonTool.execute(params);
          
          // Verify UIResource is returned
          expect(result).toBeDefined();
          expect(result.content).toBeDefined();
          expect(result.content.length).toBeGreaterThan(0);
          
          const uiResource = result.content[0];
          expect(uiResource.type).toBe('resource');
          expect(uiResource.resource).toBeDefined();
          expect(uiResource.resource.uri).toMatch(/^ui:\/\/button-response\//);
          
          // Verify response contains action details
          const htmlContent = uiResource.resource.text;
          expect(htmlContent).toContain(action);
          
          if (source !== undefined) {
            expect(htmlContent).toContain(source);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle button clicks from greeting UI', async () => {
    const result = await buttonTool.execute({
      action: 'greeting-button-clicked',
      source: 'greeting-ui'
    });

    expect(result.content[0].resource.text).toContain('greeting-button-clicked');
    expect(result.content[0].resource.text).toContain('greeting-ui');
  });
});
