/**
 * Feature: mcp-ui-chat-client, Property 7: Schema validation on deserialization
 * Validates: Requirements 9.4
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { deserializeMessage, isValidMessage } from '@/lib/serialization';
import { ChatMessageSchema } from '@/lib/types';

describe('Schema Validation - Property Tests', () => {
  it('should reject invalid message structures', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // Missing required fields
          fc.record({
            id: fc.string(),
            // missing role
            content: fc.array(fc.anything()),
            timestamp: fc.integer(),
          }),
          // Invalid role
          fc.record({
            id: fc.string(),
            role: fc.string().filter((s) => !['user', 'assistant', 'tool'].includes(s)),
            content: fc.array(fc.anything()),
            timestamp: fc.integer(),
          }),
          // Invalid content type
          fc.record({
            id: fc.string(),
            role: fc.constantFrom('user', 'assistant', 'tool'),
            content: fc.array(
              fc.record({
                type: fc.string().filter((s) => !['text', 'tool_use', 'tool_result', 'resource'].includes(s)),
              })
            ),
            timestamp: fc.integer(),
          }),
          // Invalid timestamp
          fc.record({
            id: fc.string(),
            role: fc.constantFrom('user', 'assistant', 'tool'),
            content: fc.array(fc.anything()),
            timestamp: fc.string(), // should be number
          })
        ),
        (invalidMessage) => {
          const json = JSON.stringify(invalidMessage);
          expect(() => deserializeMessage(json)).toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate message structure with isValidMessage', () => {
    fc.assert(
      fc.property(fc.anything(), (obj) => {
        const result = ChatMessageSchema.safeParse(obj);
        expect(isValidMessage(obj)).toBe(result.success);
      }),
      { numRuns: 100 }
    );
  });

  it('should reject messages with invalid UIResource structure', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // Missing uri
          fc.record({
            mimeType: fc.string(),
            text: fc.string(),
          }),
          // Missing mimeType
          fc.record({
            uri: fc.string(),
            text: fc.string(),
          }),
          // Invalid types
          fc.record({
            uri: fc.integer(), // should be string
            mimeType: fc.string(),
          })
        ),
        (invalidResource) => {
          const invalidMessage = {
            id: 'test',
            role: 'assistant',
            content: [
              {
                type: 'resource',
                resource: invalidResource,
              },
            ],
            timestamp: Date.now(),
          };

          const json = JSON.stringify(invalidMessage);
          expect(() => deserializeMessage(json)).toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept valid message structures', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }),
          role: fc.constantFrom('user' as const, 'assistant' as const, 'tool' as const),
          content: fc.array(
            fc.record({
              type: fc.constant('text' as const),
              text: fc.string(),
            }),
            { minLength: 1 }
          ),
          timestamp: fc.integer({ min: 0 }),
        }),
        (validMessage) => {
          const json = JSON.stringify(validMessage);
          expect(() => deserializeMessage(json)).not.toThrow();
          const deserialized = deserializeMessage(json);
          expect(deserialized).toEqual(validMessage);
        }
      ),
      { numRuns: 100 }
    );
  });
});
