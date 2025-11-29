/**
 * Feature: mcp-ui-chat-client, Property 1: Message submission invokes Bedrock with correct model
 * Validates: Requirements 1.1, 4.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { BedrockService } from '@/lib/services/bedrock';
import type { ChatMessage } from '@/lib/types';

// Mock AWS SDK
vi.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: vi.fn().mockImplementation(() => ({
    send: vi.fn(),
  })),
  ConverseStreamCommand: vi.fn(),
}));

// Mock environment
vi.mock('@/lib/env', () => ({
  getEnv: () => ({
    AWS_ACCESS_KEY_ID: 'test-key',
    AWS_SECRET_ACCESS_KEY: 'test-secret',
    AWS_REGION: 'us-east-1',
    BEDROCK_MODEL_ID: 'us.anthropic.claude-haiku-4-5-20251001-v1:0',
    MCP_SERVER_URL: 'http://localhost:8080/mcp',
  }),
}));

describe('Bedrock Model Invocation - Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should use the correct model ID for all message submissions', async () => {
    const { ConverseStreamCommand } = require('@aws-sdk/client-bedrock-runtime');

    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1 }),
            role: fc.constantFrom('user' as const, 'assistant' as const),
            content: fc.array(
              fc.record({
                type: fc.constant('text' as const),
                text: fc.string({ minLength: 1 }),
              }),
              { minLength: 1 }
            ),
            timestamp: fc.integer({ min: 0 }),
          }),
          { minLength: 1 }
        ),
        async (messages: ChatMessage[]) => {
          const service = new BedrockService();

          // Mock the stream response
          const mockStream = {
            async *[Symbol.asyncIterator]() {
              yield { messageStop: {} };
            },
          };

          const mockSend = vi.fn().mockResolvedValue({ stream: mockStream });
          (service as any).client = { send: mockSend };

          // Consume the stream
          const events = [];
          for await (const event of service.converseStream({ messages })) {
            events.push(event);
          }

          // Verify ConverseStreamCommand was called with correct model ID
          expect(ConverseStreamCommand).toHaveBeenCalled();
          const commandArgs = ConverseStreamCommand.mock.calls[ConverseStreamCommand.mock.calls.length - 1][0];
          expect(commandArgs.modelId).toBe('us.anthropic.claude-haiku-4-5-20251001-v1:0');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should be configured when credentials are provided', () => {
    const service = new BedrockService();
    expect(service.isConfigured()).toBe(true);
  });
});
