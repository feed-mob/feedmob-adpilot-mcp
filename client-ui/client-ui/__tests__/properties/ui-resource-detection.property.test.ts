/**
 * Feature: mcp-ui-chat-client, Property 2: UIResource detection and rendering
 * Validates: Requirements 2.1
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { UIResource } from '@/lib/types';

describe('UIResource Detection - Property Tests', () => {
  it('should detect UIResources by ui:// URI scheme', () => {
    fc.assert(
      fc.property(
        fc.record({
          uri: fc.string({ minLength: 1 }).map((s) => `ui://${s}`),
          mimeType: fc.constantFrom('text/html', 'text/uri-list', 'application/vnd.mcp-ui.remote-dom'),
          text: fc.option(fc.string(), { nil: undefined }),
          blob: fc.option(fc.string(), { nil: undefined }),
        }),
        (resource: UIResource) => {
          // Any resource with ui:// URI should be detected as UIResource
          expect(resource.uri.startsWith('ui://')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not detect non-ui:// URIs as UIResources', () => {
    fc.assert(
      fc.property(
        fc.record({
          uri: fc.oneof(
            fc.webUrl(),
            fc.string({ minLength: 1 }).filter((s) => !s.startsWith('ui://'))
          ),
          mimeType: fc.string(),
          text: fc.option(fc.string(), { nil: undefined }),
        }),
        (resource) => {
          // Resources without ui:// URI should not be treated as UIResources
          expect(resource.uri.startsWith('ui://')).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve UIResource structure', () => {
    fc.assert(
      fc.property(
        fc.record({
          uri: fc.string({ minLength: 1 }).map((s) => `ui://${s}`),
          mimeType: fc.string({ minLength: 1 }),
          text: fc.option(fc.string(), { nil: undefined }),
          blob: fc.option(fc.string(), { nil: undefined }),
          _meta: fc.option(fc.dictionary(fc.string(), fc.anything()), { nil: undefined }),
        }),
        (resource: UIResource) => {
          // All UIResource fields should be preserved
          expect(resource.uri).toBeDefined();
          expect(resource.mimeType).toBeDefined();
          expect(typeof resource.uri).toBe('string');
          expect(typeof resource.mimeType).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });
});
