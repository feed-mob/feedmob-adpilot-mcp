import { FastMCP } from 'fastmcp';
import type { Request } from 'fastmcp';
import { loadEnvironment } from './config/environment.js';
import { createDatabasePool } from './config/database.js';
import { DatabaseService } from './services/database.service.js';
import { ClaudeService } from './services/claude.service.js';
import { ImageGenerationService } from './services/image.service.js';
import { UIResourceGenerator } from './services/ui.service.js';
import { AuthService } from './services/auth.service.js';
import { logger } from './utils/logger.js';

// Load environment configuration
const env = loadEnvironment();

// Initialize services
const dbPool = createDatabasePool(env.DATABASE_URL, env.DATABASE_POOL_SIZE);
const dbService = new DatabaseService(dbPool);
const claudeService = new ClaudeService(env.ANTHROPIC_API_KEY, env.CLAUDE_MODEL);
const imageService = new ImageGenerationService(env.IMAGE_SERVICE_URL, env.IMAGE_SERVICE_API_KEY);
const uiGenerator = new UIResourceGenerator();
const authService = new AuthService();

// Create FastMCP server
const server = new FastMCP({
  name: "FeedMob AdPilot",
  version: "1.0.0",
  authenticate: async (request: Request) => {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      throw new Response('Unauthorized', { status: 401 } as ResponseInit);
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    try {
      const user = await authService.validateToken(token);
      return {
        userId: user.id,
        email: user.email,
        name: user.name
      };
    } catch (error) {
      logger.error('Authentication failed', error as Error);
      throw new Response('Invalid token', { status: 401 } as ResponseInit);
    }
  }
});

// Tools will be registered in subsequent tasks

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully...');
  await dbService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await dbService.close();
  process.exit(0);
});

// Start server
const PORT = parseInt(env.PORT);
const HOST = env.HOST;

server.start({
  transportType: "httpStream",
  httpStream: {
    port: PORT,
    endpoint: "/mcp"
  }
});

logger.info('FeedMob AdPilot MCP server started', {
  port: PORT,
  host: HOST,
  endpoint: '/mcp'
});

export { server, dbService, claudeService, imageService, uiGenerator };
