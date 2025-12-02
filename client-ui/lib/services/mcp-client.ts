import { Client } from '@modelcontextprotocol/sdk/client';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { Agent } from 'undici';
import type { ToolDefinition, ToolResult, UIResource } from '../types';
import { getEnv } from '../env';

export class MCPClientService {
  private client: Client | null = null;
  private transport: StreamableHTTPClientTransport | null = null;
  private agent: Agent | null = null;
  private tools: ToolDefinition[] = [];
  private connectionError: string | null = null;
  private serverUrl: string = '';

  constructor() {
    try {
      const env = getEnv();
      this.serverUrl = env.MCP_SERVER_URL;
    } catch (error: any) {
      this.connectionError = `Configuration error: ${error.message}`;
    }
  }

  /**
   * Connect to the MCP server via HTTP streaming transport
   */
  async connect(url?: string): Promise<void> {
    const targetUrl = url || this.serverUrl;

    if (!targetUrl) {
      this.connectionError = 'MCP_SERVER_URL is not configured';
      throw new Error(this.connectionError);
    }

    try {
      const endpoint = new URL(targetUrl);
      this.agent = new Agent({ headersTimeout: 15 * 60 * 1000 });

      // Create MCP client using the official SDK over Streamable HTTP transport
      this.client = new Client({
        name: 'mcp-ui-chat-client',
        version: '1.0.0',
      });
      this.transport = new StreamableHTTPClientTransport(
        endpoint,
        this.agent
          ? {
              fetch: (url, init) =>
                fetch(
                  url,
                  {
                    ...init,
                    // Extend RequestInit with Undici dispatcher to bump headers timeout
                    dispatcher: this.agent,
                  } as any
                ),
            }
          : undefined
      );

      // Connect to server
      await this.client.connect(this.transport);

      // Discover available tools
      await this.discoverTools();

      this.connectionError = null;
      console.log(`✅ Connected to MCP server at ${targetUrl}`);
    } catch (error: any) {
      this.client = null;
      this.transport = null;
      if (this.agent) {
        try {
          await this.agent.close();
        } catch (agentError) {
          console.error('Error closing MCP agent after failed connect:', agentError);
        }
        this.agent = null;
      }
      this.tools = [];
      this.connectionError = `Failed to connect to MCP server: ${error.message}`;
      console.error('❌', this.connectionError);
      console.error('Make sure your MCP server is running at:', targetUrl);
      console.error('Start the server with: npm run dev (in the main project directory)');
      throw new Error(this.connectionError);
    }
  }

  /**
   * Disconnect from the MCP server
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
      } catch (error) {
        console.error('Error closing MCP client:', error);
      }
      this.client = null;
    }

    if (this.transport) {
      try {
        await this.transport.close();
      } catch (error) {
        console.error('Error closing MCP transport:', error);
      }
      this.transport = null;
    }

    if (this.agent) {
      try {
        await this.agent.close();
      } catch (error) {
        console.error('Error closing MCP agent:', error);
      }
      this.agent = null;
    }

    this.tools = [];
    console.log('Disconnected from MCP server');
  }

  /**
   * Discover available tools from the MCP server
   */
  private async discoverTools(): Promise<void> {
    if (!this.client) {
      throw new Error('Client not connected');
    }

    try {
      const response = await this.client.listTools();

      this.tools = response.tools.map((tool: any) => ({
        name: tool.name,
        description: tool.description || '',
        inputSchema: tool.inputSchema || { type: 'object', properties: {} },
      }));

      console.log(`✅ Discovered ${this.tools.length} tools:`, this.tools.map(t => t.name).join(', '));
    } catch (error: any) {
      console.error('Failed to discover tools:', error);
      throw new Error(`Failed to discover tools: ${error.message}`);
    }
  }

  /**
   * Get available tools
   */
  getTools(): ToolDefinition[] {
    return this.tools;
  }

  /**
   * Execute a tool on the MCP server
   * @param name Tool name
   * @param params Tool parameters
   * @param timeoutMs Timeout in milliseconds (default: 15 minutes for long-running agent tasks)
   */
  async callTool(
    name: string,
    params: Record<string, unknown>,
    timeoutMs: number = 15 * 60 * 1000
  ): Promise<ToolResult> {
    if (!this.client) {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: Not connected to MCP server',
          },
        ],
        isError: true,
      };
    }

    try {
      console.log(`🔧 Calling tool: ${name}`, params);

      const response = await this.client.callTool(
        {
          name,
          arguments: params,
        },
        undefined,
        {
          timeout: timeoutMs,
          resetTimeoutOnProgress: true,
        }
      );

      // Convert MCP response to ToolResult
      const content: ToolResult['content'] = [];
      const responseContent = (response.content || []) as Array<any>;

      for (const item of responseContent) {
        if (item.type === 'text') {
          content.push({
            type: 'text',
            text: item.text,
          });
        } else if (item.type === 'resource') {
          // Check if this is a UIResource (has ui:// URI)
          const resource = item.resource;
          if (resource.uri?.startsWith('ui://')) {
            console.log(`✨ Found UIResource: ${resource.uri}`);
            content.push({
              type: 'resource',
              resource: {
                uri: resource.uri,
                mimeType: resource.mimeType || 'text/html',
                text: resource.text,
                blob: resource.blob,
                _meta: resource._meta,
              } as UIResource,
            });
          } else {
            // Regular resource, convert to text
            content.push({
              type: 'text',
              text: resource.text || `Resource: ${resource.uri}`,
            });
          }
        }
      }

      console.log(`✅ Tool ${name} completed successfully`);
      return {
        content,
        isError: (response.isError as boolean) || false,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'Unknown error';
      console.error(`❌ Error calling tool ${name}:`, error);
      return {
        content: [
          {
            type: 'text',
            text: `Error executing tool: ${message}`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Check if connected to MCP server
   */
  isConnected(): boolean {
    return this.client !== null;
  }

  /**
   * Get connection error if any
   */
  getConnectionError(): string | null {
    return this.connectionError;
  }
}

// Singleton instance
let mcpClientInstance: MCPClientService | null = null;

export function getMCPClient(): MCPClientService {
  if (!mcpClientInstance) {
    mcpClientInstance = new MCPClientService();
  }
  return mcpClientInstance;
}
