import { describe, it, expect } from 'vitest';
import { counterTool } from '../../src/tools/counter.js';

describe('Counter Tool Unit Tests', () => {
  describe('Valid Parameters', () => {
    it('should display counter with positive number', async () => {
      const result = await counterTool.execute({ count: 5 });
      
      expect(result.content).toBeDefined();
      expect(result.content.length).toBe(1);
      
      const uiResource = result.content[0];
      expect(uiResource.type).toBe('resource');
      expect(uiResource.resource.uri).toBe('ui://counter/5');
      expect(uiResource.resource.text).toContain('5');
    });

    it('should display counter with zero', async () => {
      const result = await counterTool.execute({ count: 0 });
      
      const html = result.content[0].resource.text;
      expect(html).toContain('0');
    });

    it('should display counter with negative number', async () => {
      const result = await counterTool.execute({ count: -10 });
      
      const html = result.content[0].resource.text;
      expect(html).toContain('-10');
    });

    it('should display counter with large number', async () => {
      const result = await counterTool.execute({ count: 999999 });
      
      const html = result.content[0].resource.text;
      expect(html).toContain('999999');
    });
  });

  describe('Invalid Parameters', () => {
    it('should reject missing count', async () => {
      await expect(
        counterTool.execute({} as any)
      ).rejects.toThrow();
    });

    it('should reject non-number count', async () => {
      await expect(
        counterTool.execute({ count: "5" } as any)
      ).rejects.toThrow();
    });
  });

  describe('UIResource Structure', () => {
    it('should include increment button', async () => {
      const result = await counterTool.execute({ count: 5 });
      const html = result.content[0].resource.text;
      
      expect(html).toContain('handleIncrement');
      expect(html).toContain('count: 6');
    });

    it('should include decrement button', async () => {
      const result = await counterTool.execute({ count: 5 });
      const html = result.content[0].resource.text;
      
      expect(html).toContain('handleDecrement');
      expect(html).toContain('count: 4');
    });

    it('should include postMessage calls', async () => {
      const result = await counterTool.execute({ count: 0 });
      const html = result.content[0].resource.text;
      
      expect(html).toContain('window.parent.postMessage');
      expect(html).toContain("toolName: 'counter'");
    });

    it('should include proper metadata', async () => {
      const result = await counterTool.execute({ count: 42 });
      const uiResource = result.content[0];
      
      expect(uiResource.resource._meta).toBeDefined();
      expect(uiResource.resource._meta?.title).toBe('Interactive Counter');
      expect(uiResource.resource._meta?.description).toContain('42');
    });

    it('should include inline CSS', async () => {
      const result = await counterTool.execute({ count: 0 });
      const html = result.content[0].resource.text;
      
      expect(html).toContain('<style>');
      expect(html).toContain('.counter-container');
    });
  });

  describe('Counter State Transitions', () => {
    it('should correctly calculate increment value', async () => {
      const result = await counterTool.execute({ count: 10 });
      const html = result.content[0].resource.text;
      
      expect(html).toContain('count: 11');
    });

    it('should correctly calculate decrement value', async () => {
      const result = await counterTool.execute({ count: 10 });
      const html = result.content[0].resource.text;
      
      expect(html).toContain('count: 9');
    });

    it('should handle increment from negative', async () => {
      const result = await counterTool.execute({ count: -1 });
      const html = result.content[0].resource.text;
      
      expect(html).toContain('count: 0');
    });

    it('should handle decrement to negative', async () => {
      const result = await counterTool.execute({ count: 0 });
      const html = result.content[0].resource.text;
      
      expect(html).toContain('count: -1');
    });
  });
});
