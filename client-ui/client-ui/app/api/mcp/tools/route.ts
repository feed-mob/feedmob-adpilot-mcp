import { NextRequest } from 'next/server';
import { getMCPClient } from '@/lib/services/mcp-client';

export const runtime = 'nodejs';

// Initialize MCP client on first request
let mcpClientInitialized = false;
let mcpClientError: string | null = null;

async function ensureMCPClient() {
  const mcpClient = getMCPClient();
  
  if (!mcpClientInitialized && !mcpClientError) {
    try {
      await mcpClient.connect();
      mcpClientInitialized = true;
      mcpClientError = null;
    } catch (error: any) {
      console.error('Failed to initialize MCP client:', error);
      mcpClientError = error.message;
      // Don't throw - allow graceful degradation
    }
  }
  
  return mcpClient;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, params } = body as {
      name: string;
      params: Record<string, unknown>;
    };

    if (!name) {
      return new Response(JSON.stringify({ error: 'Tool name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const mcpClient = await ensureMCPClient();

    if (!mcpClient.isConnected()) {
      return new Response(
        JSON.stringify({
          error: 'MCP client is not connected. Please check your MCP_SERVER_URL.',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await mcpClient.callTool(name, params || {});

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in MCP tools API:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to execute tool',
        isError: true,
        content: [{ type: 'text', text: `Error: ${error.message}` }],
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function GET() {
  try {
    const mcpClient = await ensureMCPClient();

    if (mcpClientError) {
      return new Response(
        JSON.stringify({
          error: `MCP Server not available: ${mcpClientError}. Start your MCP server at ${process.env.MCP_SERVER_URL || 'http://localhost:8080/mcp'}`,
          tools: [],
        }),
        {
          status: 200, // Return 200 so UI can display the error gracefully
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!mcpClient.isConnected()) {
      return new Response(
        JSON.stringify({
          error: 'MCP client is not connected. Please start your MCP server.',
          tools: [],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const tools = mcpClient.getTools();

    return new Response(JSON.stringify({ tools }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error getting MCP tools:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to get tools',
        tools: [],
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
