/**
 * Feature: mcp-ui-chat-client, Property 9: AI error display
 * Validates: Requirements 8.3
 */

import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { BedrockService } from '@/lib/services/bedrock';

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

describe('AI Error Display - Property Tests', () => {
  it('should display user-friendly error messages for throttling errors', async () => {
    const service = new BedrockService();

    const mockSend = vi.fn().mockRejectedValue({
      name: 'ThrottlingException',
      message: 'Rate exceeded',
    });
    (service as any).client = { send: mockSend };

    const events = [];
    for await (const event of service.converseStream({
      messages: [
        {
          id: '1',
          role: 'user',
          content: [{ type: 'text', text: 'Hello' }],
          timestamp: Date.now(),
        },
      ],
    })) {
      events.push(event);
    }

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('error');
    expect(events[0].error).toContain('Rate limit');
    expect(events[0].error).not.toContain('ThrottlingException'); // No raw error names
  });

  it('should display user-friendly error messages for validation errors', async () => {
    const service = new BedrockService();

    const mockSend = vi.fn().mockRejectedValue({
      name: 'ValidationException',
      message: 'Invalid input',
    });
    (service as any).client = { send: mockSend };

    const events = [];
    for await (const event of service.converseStream({
      messages: [
        {
          id: '1',
          role: 'user',
          content: [{ type: 'text', text: 'Hello' }],
          timestamp: Date.now(),
        },
      ],
    })) {
      events.push(event);
    }

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('error');
    expect(events[0].error).toContain('Invalid request');
    expect(events[0].error).not.toContain('ValidationException'); // No raw error names
  });

  it('should handle any error type with user-friendly messages', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string(),
          message: fc.string(),
        }),
        async (error) => {
          const service = new BedrockService();

          const mockSend = vi.fn().mockRejectedValue(error);
          (service as any).client = { send: mockSend };

          const events = [];
          for await (const event of service.converseStream({
            messages: [
              {
                id: '1',
                role: 'user',
                content: [{ type: 'text', text: 'Hello' }],
                timestamp: Date.now(),
              },
            ],
          })) {
            events.push(event);
          }

          expect(events).toHaveLength(1);
          expect(events[0].type).toBe('error');
          expect(events[0].error).toBeTruthy();
          // Should contain user-friendly prefix
          expect(events[0].error).toMatch(/Rate limit|Invalid request|Failed to communicate/);
        }
      ),
      { numRuns: 100 }
    );
  });
});
