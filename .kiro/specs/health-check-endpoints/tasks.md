# Implementation Plan

- [ ] 1. Create health check schema and types
  - [x] 1.1 Create `src/schemas/health.ts` with HealthResponseSchema and DependencyStatusSchema using Zod
    - Define DependencyStatusSchema with status, latency, and error fields
    - Define HealthResponseSchema with status, timestamp, service, version, uptime, and dependencies
    - Export TypeScript types from schemas
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [ ]* 1.2 Write property test for health response schema validation
    - **Property 1: Health response structure validation**
    - **Validates: Requirements 1.1, 2.1, 4.1, 4.2, 4.3**

- [ ] 2. Implement MCP server health endpoint
  - [x] 2.1 Create `src/health.ts` with health check HTTP server
    - Create standalone HTTP server on same port as FastMCP
    - Implement `/health` GET endpoint handler
    - Add database connectivity check with 5-second timeout
    - Track server start time for uptime calculation
    - Read version from package.json
    - Return appropriate HTTP status codes (200/503)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 2.2 Integrate health server into `src/index.ts`
    - Import and start health server alongside FastMCP
    - Pass database service reference for connectivity checks
    - Ensure graceful shutdown handles health server
    - _Requirements: 1.1, 1.5_

  - [ ]* 2.3 Write property test for healthy dependencies yield HTTP 200
    - **Property 2: Healthy dependencies yield HTTP 200**
    - **Validates: Requirements 1.2, 1.5, 2.2, 2.5**

  - [ ]* 2.4 Write property test for unhealthy dependencies yield HTTP 503
    - **Property 3: Unhealthy dependencies yield HTTP 503 with error**
    - **Validates: Requirements 1.3, 2.3, 4.4**

- [ ] 3. Enhance client-ui health endpoint
  - [x] 3.1 Create `client-ui/lib/schemas/health.ts` with shared schema
    - Copy HealthResponseSchema and DependencyStatusSchema
    - Export TypeScript types
    - _Requirements: 4.5_

  - [x] 3.2 Update `client-ui/app/api/health/route.ts` with enhanced health check
    - Add MCP server connectivity check with 5-second timeout
    - Track server start time for uptime calculation
    - Read version from package.json
    - Return consistent HealthResponse format
    - Return appropriate HTTP status codes (200/503)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 3.3 Write property test for response schema consistency
    - **Property 4: Response schema consistency**
    - **Validates: Requirements 4.5**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Update Docker Compose configurations
  - [x] 5.1 Update `docker-compose.yaml` with healthcheck configurations
    - Add healthcheck for mcp-server using `/health` endpoint
    - Add healthcheck for client-ui using `/api/health` endpoint
    - Configure appropriate intervals, timeouts, and retries
    - Update client-ui depends_on to wait for healthy mcp-server
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 5.2 Update `docker-compose.build.yaml` with healthcheck configurations
    - Mirror healthcheck configuration from docker-compose.yaml
    - Ensure consistency between both compose files
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 6. Update Dockerfiles for health check support
  - [x] 6.1 Update `Dockerfile` to ensure wget is available
    - Verify wget is installed (already present)
    - _Requirements: 3.1_

  - [x] 6.2 Update `client-ui/Dockerfile` to add wget for healthchecks
    - Add wget installation in runner stage
    - _Requirements: 3.2_

- [x] 7. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
