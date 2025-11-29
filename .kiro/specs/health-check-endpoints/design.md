# Design Document: Health Check Endpoints

## Overview

This feature implements comprehensive health check endpoints for both the MCP server and client-ui server, enabling container orchestration platforms to monitor service health. The design follows a consistent pattern across both services, with each endpoint checking its critical dependencies and returning structured JSON responses.

## Architecture

```mermaid
graph TB
    subgraph "Docker Compose"
        DC[Docker Healthcheck]
    end
    
    subgraph "Client-UI (Port 3000)"
        CUI[Next.js Server]
        CHE[/api/health]
    end
    
    subgraph "MCP Server (Port 8080)"
        MCP[FastMCP Server]
        MHE[/health]
    end
    
    subgraph "Database"
        PG[(PostgreSQL)]
    end
    
    DC -->|GET /api/health| CHE
    DC -->|GET /health| MHE
    CHE -->|Check connectivity| MCP
    MHE -->|Check connectivity| PG
    CUI --> CHE
    MCP --> MHE
```

## Components and Interfaces

### 1. Health Check Response Schema

Both servers will use a consistent response format:

```typescript
interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;           // ISO 8601 format
  service: string;             // Service name
  version: string;             // From package.json
  uptime: number;              // Seconds since start
  dependencies: {
    [name: string]: {
      status: 'connected' | 'disconnected';
      latency?: number;        // Response time in ms
      error?: string;          // Error message if disconnected
    };
  };
}
```

### 2. MCP Server Health Endpoint

**Location**: `src/index.ts` (enhanced FastMCP configuration)

**Endpoint**: `GET /health`

**Dependencies Checked**:
- PostgreSQL database connectivity (via custom health check logic)

**Implementation Approach**:
- Use FastMCP's built-in health endpoint configuration
- Enable the health endpoint in FastMCP server options
- Add custom health check route handler for detailed dependency checks
- Track server start time for uptime calculation
- Read version from package.json

### 3. Client-UI Health Endpoint

**Location**: `client-ui/app/api/health/route.ts` (enhance existing)

**Endpoint**: `GET /api/health`

**Dependencies Checked**:
- MCP server connectivity (via HTTP request to `/health`)

**Implementation Approach**:
- Enhance existing Next.js API route
- Add fetch call to MCP server health endpoint
- Include timeout handling for dependency checks
- Track server start time for uptime calculation

### 4. Docker Compose Configuration

**Files Modified**:
- `docker-compose.yaml`
- `docker-compose.build.yaml`

**Healthcheck Configuration**:
```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:PORT/ENDPOINT"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## Data Models

### HealthResponse Schema (Zod)

```typescript
import { z } from 'zod';

export const DependencyStatusSchema = z.object({
  status: z.enum(['connected', 'disconnected']),
  latency: z.number().optional(),
  error: z.string().optional(),
});

export const HealthResponseSchema = z.object({
  status: z.enum(['healthy', 'unhealthy']),
  timestamp: z.string().datetime(),
  service: z.string(),
  version: z.string(),
  uptime: z.number().nonnegative(),
  dependencies: z.record(z.string(), DependencyStatusSchema),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export type DependencyStatus = z.infer<typeof DependencyStatusSchema>;
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Health response structure validation

*For any* health check response from either server, the response SHALL contain all required fields: status (healthy/unhealthy), timestamp (valid ISO 8601), service (non-empty string), version (semver format), uptime (non-negative number), and dependencies (object with status for each dependency).

**Validates: Requirements 1.1, 2.1, 4.1, 4.2, 4.3**

### Property 2: Healthy dependencies yield HTTP 200

*For any* health check request where all dependencies are connected, the server SHALL return HTTP 200 status code and the response status field SHALL be "healthy".

**Validates: Requirements 1.2, 1.5, 2.2, 2.5**

### Property 3: Unhealthy dependencies yield HTTP 503 with error

*For any* health check request where at least one dependency is disconnected, the server SHALL return HTTP 503 status code, the response status field SHALL be "unhealthy", and the disconnected dependency SHALL include a non-empty error message.

**Validates: Requirements 1.3, 2.3, 4.4**

### Property 4: Response schema consistency

*For any* pair of health responses from MCP server and client-ui server, both responses SHALL validate against the same HealthResponseSchema, ensuring structural consistency across services.

**Validates: Requirements 4.5**

## Error Handling

### Database Connection Errors (MCP Server)

- Catch connection errors with 5-second timeout
- Return `status: "disconnected"` with error message
- Log error for debugging
- Return HTTP 503

### MCP Server Connection Errors (Client-UI)

- Catch fetch errors with 5-second timeout
- Return `status: "disconnected"` with error message
- Log error for debugging
- Return HTTP 503

### Timeout Handling

- Database check: 5 second timeout
- MCP server check: 5 second timeout
- Overall endpoint timeout: handled by Docker healthcheck configuration

## Testing Strategy

### Dual Testing Approach

This feature uses both unit tests and property-based tests:

1. **Unit Tests**: Verify specific scenarios and edge cases
2. **Property-Based Tests**: Verify universal properties across all inputs

### Property-Based Testing

**Library**: fast-check (already in project dependencies)

**Configuration**: Minimum 100 iterations per property test

**Test File**: `tests/properties/health-check.property.test.ts`

Each property-based test MUST be tagged with the format:
`**Feature: health-check-endpoints, Property {number}: {property_text}**`

### Test Categories

1. **Schema Validation Tests**
   - Generate random health responses
   - Validate against HealthResponseSchema
   - Verify round-trip serialization

2. **Status Logic Tests**
   - Generate random dependency states
   - Verify correct HTTP status code selection
   - Verify correct response status field

3. **Error Message Tests**
   - Generate random error scenarios
   - Verify error messages are present and descriptive

### Unit Tests

**Test File**: `tests/unit/health-check.test.ts`

- Test healthy database scenario
- Test unhealthy database scenario
- Test healthy MCP server scenario
- Test unhealthy MCP server scenario
- Test timeout handling
- Test response format
