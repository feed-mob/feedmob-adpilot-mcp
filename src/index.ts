import 'dotenv/config';
import { FastMCP } from 'fastmcp';
import { parseAdRequirementsTool } from './tools/parse-ad-requirements.js';
import { conductAdResearchTool } from './tools/conduct-ad-research.js';
import { generateAdCopyTool } from './tools/generate-ad-copy.js';
import { generateAdImagesTool } from './tools/generate-ad-images.js';
import { generateMixedMediaCreativeTool } from './tools/generate-mixed-media.js';
import { getCampaignTool } from './tools/get-campaign.js';
import { db } from './services/database.js';

// Initialize FastMCP server with health check endpoint
const server = new FastMCP({
  name: "FeedMob AdPilot MCP",
  version: "1.0.0",
  health: {
    enabled: true,
    message: "healthy",
    path: "/health",
    status: 200,
  }
});

// Register tools
server.addTool(parseAdRequirementsTool);
server.addTool(conductAdResearchTool);
server.addTool(generateAdCopyTool);
server.addTool(generateAdImagesTool);
server.addTool(generateMixedMediaCreativeTool);
server.addTool(getCampaignTool);

console.log('✅ Registered tools: parseAdRequirements, conductAdResearch, generateAdCopy, generateAdImages, generateMixedMediaCreative, getCampaign');

const host = process.env.FASTMCP_HOST || '0.0.0.0';

// Initialize database and start server
async function start() {
  try {
    // Connect to database
    await db.connect();
    console.log('✅ Database connected');
    
    // Run migrations
    await db.runMigrations();
    console.log('✅ Database migrations complete');
    
    // Start server with HTTP streaming transport
    server.start({
      transportType: "httpStream",
      httpStream: {
        host,
        port: 8080,
        endpoint: "/mcp"
      }
    });

    console.log(`🚀 FeedMob AdPilot MCP Server started on http://${host}:8080/mcp`);
    console.log(`✅ Health check endpoint available at http://${host}:8080/health`);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await db.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down...');
  await db.disconnect();
  process.exit(0);
});

start();
