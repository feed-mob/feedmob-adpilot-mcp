import { NextResponse } from 'next/server';
import { HealthResponseSchema, type HealthResponse, type DependencyStatus } from '@/lib/schemas/health';

// Track server start time
const startTime = Date.now();

/**
 * Check MCP server connectivity
 */
async function checkMcpServer(timeoutMs: number = 5000): Promise<DependencyStatus> {
  const mcpServerUrl = process.env.MCP_SERVER_URL || 'http://localhost:8080/mcp';
  // Convert MCP endpoint to health endpoint
  const healthUrl = mcpServerUrl.replace('/mcp', '/health');
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    if (response.ok) {
      return {
        status: 'connected',
        latency,
      };
    } else {
      return {
        status: 'disconnected',
        latency,
        error: `MCP server returned status ${response.status}`,
      };
    }
  } catch (error) {
    const latency = Date.now() - startTime;
    return {
      status: 'disconnected',
      latency,
      error: error instanceof Error ? error.message : 'Unknown MCP server error',
    };
  }
}

export async function GET() {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const timestamp = new Date().toISOString();

  // Check MCP server
  const mcpServerStatus = await checkMcpServer();

  // Determine overall health
  const isHealthy = mcpServerStatus.status === 'connected';

  const response: HealthResponse = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp,
    service: 'feedmob-adpilot-client-ui',
    version: '0.1.0',
    uptime,
    dependencies: {
      mcp_server: mcpServerStatus,
    },
  };

  // Validate response against schema
  const validatedResponse = HealthResponseSchema.parse(response);
  const statusCode = validatedResponse.status === 'healthy' ? 200 : 503;

  return NextResponse.json(validatedResponse, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
