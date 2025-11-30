import { NextResponse } from 'next/server';
import { HealthResponseSchema, type HealthResponse } from '@/lib/schemas/health';

// Track server start time for uptime reporting
const startTime = Date.now();

export async function GET() {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const timestamp = new Date().toISOString();

  const response: HealthResponse = {
    status: 'healthy',
    timestamp,
    service: 'feedmob-adpilot-client-ui',
    version: '0.1.0',
    uptime,
    dependencies: {},
  };

  // Validate response against schema
  const validatedResponse = HealthResponseSchema.parse(response);

  return NextResponse.json(validatedResponse, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
