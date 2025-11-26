import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { greetingTool } from '../../src/tools/greeting.js';
import { buttonTool } from '../../src/tools/button.js';
import { counterTool } from '../../src/tools/counter.js';

describe('UIResource Structure Property Tests', () => {
  // Feature: mcp-ui-fastmcp-demo, Property 2: UIResource structure compliance
  it('should ensure all greeting tool UIResources have proper structure', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        async (name) => {
          const result = await greetingTool.execute({ name });
          const uiResource = result.content[0];
          
          // Verify semantic URI
          expect(uiResource.resource.uri).toMatch(/^ui:\/\//);
          expect(uiResource.resource.uri).toMatch(/^ui:\/\/greeting\//);
          
          // Verify inline CSS
          const htmlContent = uiResource.resource.text;
          expect(htmlContent).toContain('<style>');
          expect(htmlContent).toContain('</style>');
          
          // Verify metadata
          expect(uiResource.resource._meta).toBeDefined();
          expect(uiResource.resource._meta?.title).toBeDefined();
          expect(uiResource.resource._meta?.description).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should ensure all button tool UIResources have proper structure', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        async (action) => {
          const result = await buttonTool.execute({ action });
          const uiResource = result.content[0];
          
          // Verify semantic URI
          expect(uiResource.resource.uri).toMatch(/^ui:\/\//);
          expect(uiResource.resource.uri).toMatch(/^ui:\/\/button-response\//);
          
          // Verify inline CSS
          const htmlContent = uiResource.resource.text;
          expect(htmlContent).toContain('<style>');
          expect(htmlContent).toContain('</style>');
          
          // Verify metadata
          expect(uiResource.resource._meta).toBeDefined();
          expect(uiResource.resource._meta?.title).toBeDefined();
          expect(uiResource.resource._meta?.description).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should ensure all counter tool UIResources have proper structure', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer(),
        async (count) => {
          const result = await counterTool.execute({ count });
          const uiResource = result.content[0];
          
          // Verify semantic URI
          expect(uiResource.resource.uri).toMatch(/^ui:\/\//);
          expect(uiResource.resource.uri).toMatch(/^ui:\/\/counter\//);
          
          // Verify inline CSS
          const htmlContent = uiResource.resource.text;
          expect(htmlContent).toContain('<style>');
          expect(htmlContent).toContain('</style>');
          
          // Verify metadata
          expect(uiResource.resource._meta).toBeDefined();
          expect(uiResource.resource._meta?.title).toBeDefined();
          expect(uiResource.resource._meta?.description).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should verify all UIResources have required mcp-ui structure', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0).map(name => ({ tool: 'greet', params: { name } })),
          fc.string({ minLength: 1 }).map(action => ({ tool: 'button', params: { action } })),
          fc.integer().map(count => ({ tool: 'counter', params: { count } }))
        ),
        async (testCase) => {
          let result;
          if (testCase.tool === 'greet') {
            result = await greetingTool.execute(testCase.params);
          } else if (testCase.tool === 'button') {
            result = await buttonTool.execute(testCase.params);
          } else {
            result = await counterTool.execute(testCase.params);
          }
          
          const uiResource = result.content[0];
          
          // Verify type
          expect(uiResource.type).toBe('resource');
          
          // Verify resource object
          expect(uiResource.resource).toBeDefined();
          expect(uiResource.resource.uri).toBeDefined();
          expect(uiResource.resource.mimeType).toBe('text/html');
          expect(uiResource.resource.text).toBeDefined();
          
          // Verify URI format
          expect(uiResource.resource.uri).toMatch(/^ui:\/\/[a-z-]+\/.+$/);
        }
      ),
      { numRuns: 100 }
    );
  });
});
