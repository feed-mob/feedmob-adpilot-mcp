/**
 * Feature: mcp-ui-chat-client, Property 8: Tool error display and conversation continuity
 * Validates: Requirements 8.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { MCPClientService } from '@/lib/services/mcp-client';

const { mockClientConstructor, mockTransportConstructor } = vi.hoisted(() => ({
  mockClientConstructor: vi.fn(),
  mockTransportConstructor: vi.fn(),
}));

// Mock MCP SDK client + transport
vi.mock('@modelcontextprotocol/sdk/client', () => ({
  Client: mockClientConstructor,
}));
vi.mock('@modelcontextprotocol/sdk/client/streamableHttp.js', () => ({
  StreamableHTTPClientTransport: mockTransportConstructor,
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

describe('Tool Error Handling - Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClientConstructor.mockImplementation(function () {
      return {
        connect: vi.fn().mockResolvedValue(undefined),
        listTools: vi.fn().mockResolvedValue({ tools: [] }),
        callTool: vi.fn(),
        close: vi.fn().mockResolvedValue(undefined),
      };
    });
    mockTransportConstructor.mockImplementation(function () {
      return {
        close: vi.fn().mockResolvedValue(undefined),
      };
    });
  });

  it('should return error result when tool execution fails', async () => {
    const SDKClient = mockClientConstructor;

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1 }),
          params: fc.dictionary(fc.string(), fc.anything()),
          errorMessage: fc.string({ minLength: 1 }),
        }),
        async ({ name, params, errorMessage }) => {
          const mockClient = {
            connect: vi.fn().mockResolvedValue(undefined),
            listTools: vi.fn().mockResolvedValue({ tools: [] }),
            callTool: vi.fn().mockRejectedValue(new Error(errorMessage)),
            close: vi.fn().mockResolvedValue(undefined),
          };

          SDKClient.mockImplementation(function () {
            return mockClient;
          });

          const service = new MCPClientService();
          await service.connect();

          const result = await service.callTool(name, params);

          // Should return error result
          expect(result.isError).toBe(true);
          expect(result.content).toHaveLength(1);
          expect(result.content[0].type).toBe('text');
          expect((result.content[0] as any).text).toContain('Error');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow conversation to continue after tool error', async () => {
    const SDKClient = mockClientConstructor;

    const mockClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      listTools: vi.fn().mockResolvedValue({ tools: [] }),
      callTool: vi
        .fn()
        .mockRejectedValueOnce(new Error('First call failed'))
        .mockResolvedValueOnce({
          content: [{ type: 'text', text: 'Success' }],
          isError: false,
        }),
      close: vi.fn().mockResolvedValue(undefined),
    };

    SDKClient.mockImplementation(function () {
      return mockClient;
    });

    const service = new MCPClientService();
    await service.connect();

    // First call fails
    const result1 = await service.callTool('testTool', {});
    expect(result1.isError).toBe(true);

    // Service should still be connected
    expect(service.isConnected()).toBe(true);

    // Second call succeeds
    const result2 = await service.callTool('testTool', {});
    expect(result2.isError).toBe(false);
  });

  it('should handle tool errors without crashing', async () => {
    const SDKClient = mockClientConstructor;

    await fc.assert(
      fc.asyncProperty(
        fc.anything(),
        async (errorValue) => {
          const mockClient = {
            connect: vi.fn().mockResolvedValue(undefined),
            listTools: vi.fn().mockResolvedValue({ tools: [] }),
            callTool: vi.fn().mockRejectedValue(errorValue),
            close: vi.fn().mockResolvedValue(undefined),
          };

          SDKClient.mockImplementation(function () {
            return mockClient;
          });

          const service = new MCPClientService();
          await service.connect();

          // Should not throw, should return error result
          const result = await service.callTool('anyTool', {});
          expect(result).toBeDefined();
          expect(result.content).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});
