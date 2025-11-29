# Requirements Document

## Introduction

This specification defines the Docker containerization and Coolify deployment configuration for the FeedMob AdPilot MCP project. The project consists of three services: an MCP server (FastMCP backend), a Next.js client UI, and a PostgreSQL database. The deployment must support Coolify's docker-compose based deployment model with proper networking, health checks, and environment variable management.

## Glossary

- **MCP Server**: The FastMCP-based backend service that exposes MCP tools via HTTP streaming on port 8080
- **Client UI**: The Next.js frontend application that communicates with the MCP server
- **Coolify**: A self-hosted PaaS platform that supports docker-compose deployments
- **Health Check**: An endpoint or command that verifies a service is running correctly
- **Multi-stage Build**: A Docker build technique that separates build and runtime stages to reduce image size

## Requirements

### Requirement 1

**User Story:** As a DevOps engineer, I want to build the MCP server as a Docker image, so that I can deploy it consistently across environments.

#### Acceptance Criteria

1. WHEN the MCP server Dockerfile is built THEN the system SHALL produce a minimal Node.js 20 Alpine-based image with only production dependencies
2. WHEN the build process runs THEN the system SHALL use multi-stage builds to separate compilation from runtime
3. WHEN the container starts THEN the system SHALL expose port 8080 for HTTP streaming
4. WHEN the container runs THEN the system SHALL execute the compiled JavaScript from the dist directory
5. WHEN the Dockerfile is created THEN the system SHALL place it at the project root as `Dockerfile`

### Requirement 2

**User Story:** As a DevOps engineer, I want to build the Client UI as a Docker image, so that I can deploy the frontend alongside the backend.

#### Acceptance Criteria

1. WHEN the Client UI Dockerfile is built THEN the system SHALL produce a minimal Node.js 20 Alpine-based image optimized for Next.js standalone output
2. WHEN the build process runs THEN the system SHALL use multi-stage builds to separate dependency installation, build, and runtime
3. WHEN the container starts THEN the system SHALL expose port 3000 for the Next.js application
4. WHEN the container runs THEN the system SHALL use Next.js standalone mode for optimal production performance
5. WHEN the Dockerfile is created THEN the system SHALL place it in the client-ui directory as `client-ui/Dockerfile`

### Requirement 3

**User Story:** As a DevOps engineer, I want a docker-compose configuration for Coolify, so that I can deploy all services together with proper networking.

#### Acceptance Criteria

1. WHEN docker-compose is executed THEN the system SHALL start three services: mcp-server, client-ui, and postgres
2. WHEN services start THEN the system SHALL configure an internal network for inter-service communication
3. WHEN the mcp-server starts THEN the system SHALL wait for postgres to be healthy before accepting connections
4. WHEN the client-ui starts THEN the system SHALL wait for mcp-server to be healthy before accepting connections
5. WHEN services communicate internally THEN the system SHALL use service names as hostnames (mcp-server:8080, postgres:5432)
6. WHEN the docker-compose file is created THEN the system SHALL place it at the project root as `docker-compose.yaml` (replacing the existing development-only file)

### Requirement 4

**User Story:** As a DevOps engineer, I want health checks configured for all services, so that Coolify can monitor service availability.

#### Acceptance Criteria

1. WHEN the mcp-server is running THEN the system SHALL respond to health checks on the /ready endpoint
2. WHEN the client-ui is running THEN the system SHALL respond to health checks on a designated health endpoint
3. WHEN postgres is running THEN the system SHALL respond to pg_isready health checks
4. WHEN a health check fails THEN the system SHALL report the service as unhealthy to Coolify

### Requirement 5

**User Story:** As a DevOps engineer, I want environment variables properly configured, so that I can manage secrets through Coolify's environment management.

#### Acceptance Criteria

1. WHEN the docker-compose file is parsed THEN the system SHALL reference environment variables using Coolify-compatible syntax
2. WHEN the mcp-server starts THEN the system SHALL receive DATABASE_URL and AWS credentials from environment
3. WHEN the client-ui starts THEN the system SHALL receive MCP_SERVER_URL and AWS credentials from environment
4. WHEN postgres starts THEN the system SHALL receive database credentials from environment

### Requirement 6

**User Story:** As a DevOps engineer, I want persistent storage configured for the database, so that data survives container restarts.

#### Acceptance Criteria

1. WHEN postgres container restarts THEN the system SHALL preserve all database data in a named volume
2. WHEN the volume is created THEN the system SHALL use a local driver for Coolify compatibility
