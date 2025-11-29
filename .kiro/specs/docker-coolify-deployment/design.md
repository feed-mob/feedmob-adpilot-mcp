# Design Document: Docker Coolify Deployment

## Overview

This design specifies the Docker containerization strategy for deploying the FeedMob AdPilot MCP project to Coolify. The solution uses multi-stage Docker builds for both the MCP server and Next.js client, with a unified docker-compose configuration that manages all three services (mcp-server, client-ui, postgres) with proper health checks, networking, and environment variable management.

## Architecture

```mermaid
graph TB
    subgraph "Coolify Host"
        subgraph "Docker Network: adpilot-network"
            UI[Client UI<br/>:3000]
            MCP[MCP Server<br/>:8080]
            DB[(PostgreSQL<br/>:5432)]
        end
        
        VOL[(postgres_data<br/>volume)]
    end
    
    USER[User Browser] --> UI
    UI -->|MCP_SERVER_URL| MCP
    MCP -->|DATABASE_URL| DB
    DB --> VOL
    
    style UI fill:#4CAF50
    style MCP fill:#2196F3
    style DB fill:#FF9800
```

## Components and Interfaces

### 1. MCP Server Container

**Location:** `Dockerfile` (project root)

**Build Strategy:** Multi-stage build with 3 stages:
1. **deps** - Install all dependencies (including devDependencies for build)
2. **builder** - Compile TypeScript to JavaScript
3. **runner** - Production runtime with only production dependencies

**Base Image:** `node:20-alpine`

**Exposed Port:** 8080

**Health Check:** `GET /ready`

**Key Configuration:**
- Working directory: `/app`
- Non-root user for security
- Only `dist/`, `node_modules/`, and `src/plugins/` copied to runtime

### 2. Client UI Container

**Location:** `client-ui/Dockerfile`

**Build Strategy:** Multi-stage build with 4 stages:
1. **deps** - Install dependencies
2. **builder** - Build Next.js with standalone output
3. **runner** - Production runtime with standalone server

**Base Image:** `node:20-alpine`

**Exposed Port:** 3000

**Health Check:** `GET /api/health` (new endpoint to create)

**Key Configuration:**
- Next.js standalone output mode
- Environment variables passed at runtime
- Non-root user for security

### 3. PostgreSQL Container

**Image:** `postgres:16-alpine`

**Exposed Port:** 5432 (internal only)

**Health Check:** `pg_isready -U $POSTGRES_USER -d $POSTGRES_DB`

**Volume:** `postgres_data` for data persistence

### 4. Docker Compose Configuration

**Location:** `docker-compose.yaml` (project root)

**Services:**
- `mcp-server` - Built from root Dockerfile
- `client-ui` - Built from client-ui/Dockerfile
- `postgres` - PostgreSQL 16 Alpine

**Network:** `adpilot-network` (bridge driver)

**Dependency Chain:**
```
postgres (healthy) → mcp-server (healthy) → client-ui
```

## Data Models

### Environment Variables

#### MCP Server
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://feedmob:pass@postgres:5432/feedmob_adpilot` |
| `AWS_REGION` | AWS region | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | AWS access key | - |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | - |
| `AWS_RETRY_MODE` | AWS retry mode | `adaptive` |
| `AWS_MAX_ATTEMPTS` | AWS max retry attempts | `20` |
| `CLAUDE_CODE_USE_BEDROCK` | Enable Bedrock | `1` |
| `ANTHROPIC_SMALL_FAST_MODEL` | Fast model ID | `us.anthropic.claude-haiku-4-5-20251001-v1:0` |
| `ANTHROPIC_MODEL` | Main model ID | `us.anthropic.claude-sonnet-4-5-20250929-v1:0` |
| `TAVILY_API_KEY` | Tavily API key | - |
| `GOOGLE_API_KEY` | Google API key | - |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key | - |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key | - |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint | `https://ik.imagekit.io/xxxx` |

#### Client UI
| Variable | Description | Example |
|----------|-------------|---------|
| `MCP_SERVER_URL` | Internal MCP server URL | `http://mcp-server:8080/mcp` |
| `AWS_ACCESS_KEY_ID` | AWS credentials | - |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials | - |
| `AWS_REGION` | AWS region | `us-east-1` |
| `BEDROCK_MODEL_ID` | Bedrock model ID | `us.anthropic.claude-haiku-4-5-20251001-v1:0` |

#### PostgreSQL
| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_USER` | Database user | `feedmob` |
| `POSTGRES_PASSWORD` | Database password | - |
| `POSTGRES_DB` | Database name | `feedmob_adpilot` |

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, all acceptance criteria are testable as examples (specific verification scenarios) rather than properties (universal rules across all inputs). This is expected for infrastructure/deployment configurations where we verify specific configurations rather than testing across input spaces.

**Verification Examples (Manual/CI):**

1. **Build Verification**: Docker images build successfully without errors
2. **Service Startup**: All three services start and become healthy
3. **Network Connectivity**: Services can communicate via internal hostnames
4. **Health Endpoints**: Each service responds to its health check endpoint
5. **Environment Variables**: Services receive and use environment variables correctly
6. **Data Persistence**: PostgreSQL data survives container restarts

## Error Handling

### Build Failures
- Multi-stage builds fail fast if any stage fails
- Clear error messages from npm/tsc for debugging
- Build context limited to necessary files via `.dockerignore`

### Runtime Failures
- Health checks detect service failures
- `depends_on` with `condition: service_healthy` prevents cascade failures
- Restart policy `unless-stopped` for automatic recovery

### Database Connection Failures
- MCP server waits for postgres health before starting
- Connection retry logic in application code
- Clear error logging for connection issues

## Testing Strategy

### Manual Verification
Since this is infrastructure configuration, testing is primarily manual verification:

1. **Local Build Test**
   ```bash
   docker-compose build
   ```

2. **Local Run Test**
   ```bash
   docker-compose up -d
   docker-compose ps  # Verify all services healthy
   ```

3. **Health Check Verification**
   ```bash
   curl http://localhost:8080/ready  # MCP server
   curl http://localhost:3000/api/health  # Client UI
   ```

4. **Network Connectivity Test**
   ```bash
   docker-compose exec client-ui wget -qO- http://mcp-server:8080/ready
   ```

5. **Volume Persistence Test**
   ```bash
   docker-compose down
   docker-compose up -d
   # Verify data persists
   ```

### CI/CD Integration
- Build verification in CI pipeline
- Image scanning for vulnerabilities
- Deployment to staging before production

## File Structure

```
project-root/
├── Dockerfile                    # MCP server Dockerfile
├── .dockerignore                 # Build context exclusions
├── docker-compose.yaml           # Production compose file
├── client-ui/
│   ├── Dockerfile               # Client UI Dockerfile
│   ├── .dockerignore            # Client build exclusions
│   └── app/
│       └── api/
│           └── health/
│               └── route.ts     # Health check endpoint
└── ...
```
