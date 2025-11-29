import { z } from 'zod';

/**
 * Schema for individual dependency status
 */
export const DependencyStatusSchema = z.object({
  status: z.enum(['connected', 'disconnected']),
  latency: z.number().optional(),
  error: z.string().optional(),
});

export type DependencyStatus = z.infer<typeof DependencyStatusSchema>;

/**
 * Schema for health check response
 * Used by both MCP server and client-ui for consistent health reporting
 */
export const HealthResponseSchema = z.object({
  status: z.enum(['healthy', 'unhealthy']),
  timestamp: z.string().datetime(),
  service: z.string(),
  version: z.string(),
  uptime: z.number().nonnegative(),
  dependencies: z.record(z.string(), DependencyStatusSchema),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
