import { describe, it, expect } from 'vitest';
import { greetingTool } from '../../src/tools/greeting.js';

describe('Greeting Tool Unit Tests', () => {
  describe('Valid Parameters', () => {
    it('should generate greeting for simple name', async () => {
      const result = await greetingTool.execute({ name: 'Alice' });
      
      expect(result.content).toBeDefined();
      expect(result.content.length).toBe(1);
      
      const uiResource = result.content[0];
      expect(uiResource.type).toBe('resource');
      expect(uiResource.resource.uri).toBe('ui://greeting/Alice');
      expect(uiResource.resource.text).toContain('Alice');
    });

    it('should generate greeting for name with spaces', async () => {
      const result = await greetingTool.execute({ name: 'John Doe' });
      
      const uiResource = result.content[0];
      expect(uiResource.resource.uri).toContain('John%20Doe');
      expect(uiResource.resource.text).toContain('John Doe');
    });

    it('should generate greeting for name with special characters', async () => {
      const result = await greetingTool.execute({ name: 'José' });
      
      const uiResource = result.content[0];
      expect(uiResource.resource.text).toContain('José');
    });
  });

  describe('Invalid Parameters', () => {
    it('should reject empty string', async () => {
      await expect(
        greetingTool.execute({ name: '' })
      ).rejects.toThrow();
    });

    it('should reject whitespace-only string', async () => {
      await expect(
        greetingTool.execute({ name: '   ' })
      ).rejects.toThrow();
    });
  });

  describe('UIResource Structure', () => {
    it('should include interactive button', async () => {
      const result = await greetingTool.execute({ name: 'Bob' });
      const html = result.content[0].resource.text;
      
      expect(html).toContain('<button');
      expect(html).toContain('handleButtonClick');
      expect(html).toContain('window.parent.postMessage');
    });

    it('should include proper metadata', async () => {
      const result = await greetingTool.execute({ name: 'Charlie' });
      const uiResource = result.content[0];
      
      expect(uiResource.resource._meta).toBeDefined();
      expect(uiResource.resource._meta?.title).toContain('Charlie');
      expect(uiResource.resource._meta?.description).toBeDefined();
    });

    it('should include inline CSS', async () => {
      const result = await greetingTool.execute({ name: 'Diana' });
      const html = result.content[0].resource.text;
      
      expect(html).toContain('<style>');
      expect(html).toContain('.greeting-container');
    });
  });
});
