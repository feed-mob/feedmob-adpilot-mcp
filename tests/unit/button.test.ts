import { describe, it, expect } from 'vitest';
import { buttonTool } from '../../src/tools/button.js';

describe('Button Tool Unit Tests', () => {
  describe('Valid Parameters', () => {
    it('should handle action without source', async () => {
      const result = await buttonTool.execute({ 
        action: 'test-action' 
      });
      
      expect(result.content).toBeDefined();
      expect(result.content.length).toBe(1);
      
      const uiResource = result.content[0];
      expect(uiResource.type).toBe('resource');
      expect(uiResource.resource.uri).toMatch(/^ui:\/\/button-response\//);
      expect(uiResource.resource.text).toContain('test-action');
    });

    it('should handle action with source', async () => {
      const result = await buttonTool.execute({ 
        action: 'greeting-button-clicked',
        source: 'greeting-ui'
      });
      
      const html = result.content[0].resource.text;
      expect(html).toContain('greeting-button-clicked');
      expect(html).toContain('greeting-ui');
    });

    it('should include timestamp in response', async () => {
      const result = await buttonTool.execute({ 
        action: 'test' 
      });
      
      const html = result.content[0].resource.text;
      expect(html).toContain('Timestamp:');
      expect(html).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('Invalid Parameters', () => {
    it('should reject missing action', async () => {
      await expect(
        buttonTool.execute({} as any)
      ).rejects.toThrow();
    });

    it('should reject non-string action', async () => {
      await expect(
        buttonTool.execute({ action: 123 } as any)
      ).rejects.toThrow();
    });
  });

  describe('UIResource Structure', () => {
    it('should have unique URI for each invocation', async () => {
      const result1 = await buttonTool.execute({ action: 'test' });
      await new Promise(resolve => setTimeout(resolve, 10));
      const result2 = await buttonTool.execute({ action: 'test' });
      
      expect(result1.content[0].resource.uri).not.toBe(
        result2.content[0].resource.uri
      );
    });

    it('should include proper metadata', async () => {
      const result = await buttonTool.execute({ action: 'test-action' });
      const uiResource = result.content[0];
      
      expect(uiResource.resource._meta).toBeDefined();
      expect(uiResource.resource._meta?.title).toBe('Button Action Response');
      expect(uiResource.resource._meta?.description).toContain('test-action');
    });

    it('should include inline CSS', async () => {
      const result = await buttonTool.execute({ action: 'test' });
      const html = result.content[0].resource.text;
      
      expect(html).toContain('<style>');
      expect(html).toContain('.button-response-container');
    });
  });
});
