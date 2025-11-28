/**
 * Feature: mcp-ui-chat-client, Property 6: Message serialization round-trip
 * Validates: Requirements 9.1, 9.2, 9.3
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  serializeMessage,
  deserializeMessage,
  serializeSession,
  deserializeSession,
} from '@/lib/serialization';
import type { ChatMessage, ChatSession, MessageContent, UIResource } from '@/lib/types';

// Arbitrary generators
const uiResourceArbitrary: fc.Arbitrary<UIResource> = fc.record({
  uri: fc.string({ minLength: 1 }).map((s) => `ui://${s}`),
  mimeType: fc.constantFrom('text/html', 'text/uri-list', 'application/vnd.mcp-ui.remote-dom'),
  text: fc.option(fc.string(), { nil: undefined }),
  blob: fc.option(fc.string(), { nil: undefined }),
  _meta: fc.option(fc.dictionary(fc.string(), fc.anything()), { nil: undefined }),
});

const messageContentArbitrary: fc.Arbitrary<MessageContent> = fc.oneof(
  fc.record({
    type: fc.constant('text' as const),
    text: fc.string(),
  }),
  fc.record({
    type: fc.constant('tool_use' as const),
    toolUseId: fc.string({ minLength: 1 }),
    name: fc.string({ minLength: 1 }),
    input: fc.dictionary(fc.string(), fc.anything()),
  }),
  fc.record({
    type: fc.constant('tool_result' as const),
    toolUseId: fc.string({ minLength: 1 }),
    content: fc.array(
      fc.oneof(
        fc.record({
          type: fc.constant('text' as const),
          text: fc.string(),
        }),
        fc.record({
          type: fc.constant('resource' as const),
          resource: uiResourceArbitrary,
        })
      )
    ),
  }),
  fc.record({
    type: fc.constant('resource' as const),
    resource: uiResourceArbitrary,
  })
);

const chatMessageArbitrary: fc.Arbitrary<ChatMessage> = fc.record({
  id: fc.string({ minLength: 1 }),
  role: fc.constantFrom('user' as const, 'assistant' as const, 'tool' as const),
  content: fc.array(messageContentArbitrary, { minLength: 1 }),
  timestamp: fc.integer({ min: 0 }),
});

const chatSessionArbitrary: fc.Arbitrary<ChatSession> = fc.record({
  id: fc.string({ minLength: 1 }),
  title: fc.string({ minLength: 1 }),
  messages: fc.array(chatMessageArbitrary),
  createdAt: fc.integer({ min: 0 }),
  updatedAt: fc.integer({ min: 0 }),
});

describe('Message Serialization - Property Tests', () => {
  it('should round-trip chat messages through JSON serialization', () => {
    fc.assert(
      fc.property(chatMessageArbitrary, (message) => {
        const json = serializeMessage(message);
        const deserialized = deserializeMessage(json);
        expect(deserialized).toEqual(message);
      }),
      { numRuns: 100 }
    );
  });

  it('should round-trip chat sessions through JSON serialization', () => {
    fc.assert(
      fc.property(chatSessionArbitrary, (session) => {
        const json = serializeSession(session);
        const deserialized = deserializeSession(json);
        expect(deserialized).toEqual(session);
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve UIResource fields in serialization', () => {
    fc.assert(
      fc.property(uiResourceArbitrary, (resource) => {
        const message: ChatMessage = {
          id: 'test-id',
          role: 'assistant',
          content: [{ type: 'resource', resource }],
          timestamp: Date.now(),
        };

        const json = serializeMessage(message);
        const deserialized = deserializeMessage(json);

        const deserializedResource = (deserialized.content[0] as any).resource;
        expect(deserializedResource.uri).toBe(resource.uri);
        expect(deserializedResource.mimeType).toBe(resource.mimeType);
        if (resource.text !== undefined) {
          expect(deserializedResource.text).toBe(resource.text);
        }
        if (resource.blob !== undefined) {
          expect(deserializedResource.blob).toBe(resource.blob);
        }
        if (resource._meta !== undefined) {
          expect(deserializedResource._meta).toEqual(resource._meta);
        }
      }),
      { numRuns: 100 }
    );
  });
});
