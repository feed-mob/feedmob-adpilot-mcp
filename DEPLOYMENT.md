# FeedMob AdPilot - Coolify Deployment Guide

This guide explains how to deploy the FeedMob AdPilot MCP project to Coolify using Docker Compose.

## Prerequisites

- Coolify instance running and accessible
- Docker and Docker Compose installed on Coolify host
- AWS account with Bedrock access
- Required API keys (Tavily, ImageKit, etc.)

## Docker Images

Docker images are automatically built and published to GitHub Container Registry (ghcr.io) on every push to `main`:

- **MCP Server**: `ghcr.io/feedmob/feedmob_adpilot_mcp:latest`
- **Client UI**: `ghcr.io/feedmob/feedmob_adpilot_mcp-ui:latest`

Available tags:
- `latest` - Latest build from main branch
- `main` - Same as latest
- `v1.0.0` - Semantic version tags
- `<sha>` - Specific commit SHA

## Project Structure

```
.
├── Dockerfile                    # MCP server Docker image
├── .dockerignore                 # MCP server build exclusions
├── docker-compose.yaml           # Production compose (uses ghcr.io images)
├── docker-compose.build.yaml     # Local development (builds from source)
├── .env.coolify.example          # Environment variables template
├── .github/workflows/
│   └── docker-publish.yml        # CI/CD for building Docker images
└── client-ui/
    ├── Dockerfile               # Client UI Docker image
    ├── .dockerignore            # Client UI build exclusions
    └── app/api/health/route.ts # Health check endpoint
```

## Services

The deployment consists of three services:

1. **postgres** - PostgreSQL 16 database
2. **mcp-server** - FastMCP backend (port 8080)
3. **client-ui** - Next.js frontend (port 3000)

## Deployment Steps

### 1. Prepare Environment Variables

Copy `.env.coolify.example` and configure all required variables:

```bash
cp .env.coolify.example .env
```

Edit `.env` and set:

- **PostgreSQL credentials** (POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB)
- **AWS credentials** (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION)
- **Claude/Bedrock models** (ANTHROPIC_MODEL, ANTHROPIC_SMALL_FAST_MODEL)
- **API keys** (TAVILY_API_KEY, GOOGLE_API_KEY)
- **ImageKit credentials** (IMAGEKIT_PRIVATE_KEY, IMAGEKIT_PUBLIC_KEY, IMAGEKIT_URL_ENDPOINT)

### 2. Deploy to Coolify

#### Option A: Using Pre-built Images (Recommended)

The `docker-compose.yaml` uses pre-built images from GitHub Container Registry:

```bash
# Pull and start services
docker-compose up -d

# Or specify a specific version
IMAGE_TAG=v1.0.0 docker-compose up -d
```

#### Option B: Using Coolify UI

1. Create a new project in Coolify
2. Select "Docker Compose" as the deployment type
3. Connect your Git repository
4. Set the repository branch (e.g., `main`)
5. In the Environment section, paste all variables from `.env.coolify.example`
6. Add `IMAGE_TAG=latest` (or specific version)
7. Configure the following settings:
   - **Start Command**: `docker-compose up -d`
   - **Port Mappings**: 
     - MCP Server: 8080
     - Client UI: 3000
8. Click "Deploy"

#### Option C: Building from Source

For local development or custom builds:

```bash
# Use the build compose file
docker-compose -f docker-compose.build.yaml up --build -d
```

### 3. Verify Deployment

Once deployed, verify all services are healthy:

```bash
# Check service status
docker-compose ps

# Check health endpoints
curl http://your-domain:8080/ready        # MCP server
curl http://your-domain:3000/api/health   # Client UI

# Check logs
docker-compose logs -f mcp-server
docker-compose logs -f client-ui
docker-compose logs -f postgres
```

## Service Dependencies

The services start in the following order:

```
postgres (healthy) → mcp-server (healthy) → client-ui
```

Each service waits for the previous one to be healthy before starting.

## Health Checks

- **postgres**: `pg_isready` command (every 10s)
- **mcp-server**: `GET /ready` endpoint (every 30s)
- **client-ui**: `GET /api/health` endpoint (every 30s)

## Networking

All services communicate via an internal Docker network (`adpilot-network`):

- Client UI → MCP Server: `http://mcp-server:8080/mcp`
- MCP Server → PostgreSQL: `postgresql://user:pass@postgres:5432/db`

External access:
- MCP Server: `http://your-domain:8080`
- Client UI: `http://your-domain:3000`

## Data Persistence

PostgreSQL data is stored in a named volume (`postgres_data`) that persists across container restarts.

## Environment Variables Reference

### Required Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `POSTGRES_PASSWORD` | postgres | Database password (required) |
| `AWS_ACCESS_KEY_ID` | mcp-server, client-ui | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | mcp-server, client-ui | AWS secret key |
| `TAVILY_API_KEY` | mcp-server | Tavily API key |
| `IMAGEKIT_PRIVATE_KEY` | mcp-server | ImageKit private key |
| `IMAGEKIT_PUBLIC_KEY` | mcp-server | ImageKit public key |
| `IMAGEKIT_URL_ENDPOINT` | mcp-server | ImageKit URL endpoint |

### Optional Variables (with defaults)

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | `feedmob` | Database user |
| `POSTGRES_DB` | `feedmob_adpilot` | Database name |
| `MCP_PORT` | `8080` | MCP server external port |
| `CLIENT_PORT` | `3000` | Client UI external port |
| `AWS_REGION` | `us-east-1` | AWS region |
| `AWS_RETRY_MODE` | `adaptive` | AWS retry mode |
| `AWS_MAX_ATTEMPTS` | `20` | AWS max retry attempts |
| `CLAUDE_CODE_USE_BEDROCK` | `1` | Enable Bedrock |
| `MCP_SERVER_URL` | `http://mcp-server:8080/mcp` | Internal MCP URL |

## Troubleshooting

### Services Not Starting

Check logs for errors:
```bash
docker-compose logs mcp-server
docker-compose logs client-ui
docker-compose logs postgres
```

### Database Connection Issues

Verify DATABASE_URL is correctly constructed:
```bash
docker-compose exec mcp-server env | grep DATABASE_URL
```

### Health Check Failures

Check if services are responding:
```bash
docker-compose exec mcp-server wget -qO- http://localhost:8080/ready
docker-compose exec client-ui wget -qO- http://localhost:3000/api/health
```

### Build Failures

Rebuild images from scratch:
```bash
docker-compose build --no-cache
docker-compose up -d
```

## Local Testing

Test the deployment locally before pushing to Coolify:

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean up (including volumes)
docker-compose down -v
```

## Updating the Deployment

### Using Pre-built Images

Images are automatically built on push to `main`. To update:

```bash
# Pull latest images and restart
docker-compose pull
docker-compose up -d

# Or update to a specific version
IMAGE_TAG=v1.2.0 docker-compose up -d
```

### Building from Source

```bash
# Push changes to Git
git add .
git commit -m "Update application"
git push origin main

# Build and deploy locally
docker-compose -f docker-compose.build.yaml up --build -d
```

## Security Considerations

1. **Never commit `.env` files** - Use `.env.coolify.example` as a template
2. **Use strong passwords** - Especially for POSTGRES_PASSWORD
3. **Rotate API keys regularly** - Update in Coolify environment settings
4. **Use HTTPS in production** - Configure reverse proxy in Coolify
5. **Limit port exposure** - Only expose necessary ports (8080, 3000)

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review health checks: `docker-compose ps`
- Verify environment variables: `docker-compose config`
