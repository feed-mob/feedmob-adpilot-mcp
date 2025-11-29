# Implementation Plan

- [x] 1. Create MCP Server Dockerfile
  - [x] 1.1 Create multi-stage Dockerfile at project root
    - Stage 1 (deps): Install all dependencies including devDependencies
    - Stage 2 (builder): Compile TypeScript to dist/
    - Stage 3 (runner): Copy only production artifacts
    - Use node:20-alpine as base image
    - Expose port 8080
    - Set non-root user for security
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [x] 1.2 Create .dockerignore for MCP server
    - Exclude node_modules, .git, tests, client-ui build artifacts
    - Include only necessary source files
    - _Requirements: 1.1_

- [x] 2. Create Client UI Dockerfile
  - [x] 2.1 Update Next.js config for standalone output
    - Add `output: 'standalone'` to next.config.ts
    - _Requirements: 2.4_
  - [x] 2.2 Create health check API endpoint
    - Create `client-ui/app/api/health/route.ts`
    - Return JSON with status and timestamp
    - _Requirements: 4.2_
  - [x] 2.3 Create multi-stage Dockerfile in client-ui directory
    - Stage 1 (deps): Install dependencies
    - Stage 2 (builder): Build Next.js with standalone output
    - Stage 3 (runner): Copy standalone server and static files
    - Use node:20-alpine as base image
    - Expose port 3000
    - Set non-root user for security
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [x] 2.4 Create .dockerignore for client-ui
    - Exclude node_modules, .next, .git
    - Include only necessary source files
    - _Requirements: 2.1_

- [x] 3. Create Docker Compose configuration
  - [x] 3.1 Create production docker-compose.yaml
    - Define three services: mcp-server, client-ui, postgres
    - Configure internal network (adpilot-network)
    - Set up health checks for all services
    - Configure depends_on with service_healthy conditions
    - Use environment variable references for Coolify
    - Configure postgres volume for data persistence
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2_

- [x] 4. Create environment template for Coolify
  - [x] 4.1 Create .env.coolify.example with all required variables
    - Document all MCP server environment variables
    - Document all Client UI environment variables
    - Document PostgreSQL credentials
    - Add comments explaining each variable
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 5. Checkpoint - Verify Docker configuration
  - Ensure all files are created correctly
  - Verify Dockerfile syntax
  - Verify docker-compose.yaml syntax
  - Ask the user if questions arise
