/**
 * Feature: mcp-ui-chat-client, Property 5: Tool discovery after connection
 * Validates: Requirements 3.3
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

describe('Tool Discovery - Property Tests', () => {
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

  it('should discover all tools after successful connection', async () => {
    const SDKClient = mockClientConstructor;

    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1 }),
            description: fc.string(),
            inputSchema: fc.record({
              type: fc.constant('object'),
              properties: fc.dictionary(fc.string(), fc.anything()),
            }),
          }),
          { minLength: 0, maxLength: 10 }
        ),
        async (mockTools) => {
          // Setup mock to return our tools
          const mockClient = {
            connect: vi.fn().mockResolvedValue(undefined),
            listTools: vi.fn().mockResolvedValue({ tools: mockTools }),
            callTool: vi.fn(),
            close: vi.fn().mockResolvedValue(undefined),
          };

          SDKClient.mockImplementation(function () {
            return mockClient;
          });

          const service = new MCPClientService();
          await service.connect();

          const discoveredTools = service.getTools();

          // Should have discovered all tools
          expect(discoveredTools).toHaveLength(mockTools.length);

          // Each tool should be present
          for (const mockTool of mockTools) {
            const found = discoveredTools.find((t) => t.name === mockTool.name);
            expect(found).toBeDefined();
            expect(found?.description).toBe(mockTool.description);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have tools accessible after connection', async () => {
    const SDKClient = mockClientConstructor;

    const mockTools = [
      {
        name: 'testTool',
        description: 'A test tool',
        inputSchema: { type: 'object', properties: {} },
      },
    ];

    const mockClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      listTools: vi.fn().mockResolvedValue({ tools: mockTools }),
      callTool: vi.fn(),
      close: vi.fn().mockResolvedValue(undefined),
    };

    SDKClient.mockImplementation(function () {
      return mockClient;
    });

    const service = new MCPClientService();
    await service.connect();

    expect(service.isConnected()).toBe(true);
    expect(service.getTools().length).toBeGreaterThan(0);
  });
});
