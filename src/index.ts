import 'dotenv/config';
import { FastMCP } from 'fastmcp';
import { parseAdRequirementsTool } from './tools/parse-ad-requirements.js';
import { conductAdResearchTool } from './tools/conduct-ad-research.js';
import { generateAdCopyTool } from './tools/generate-ad-copy.js';
import { generateAdImagesTool } from './tools/generate-ad-images.js';
import { generateMixedMediaCreativeTool } from './tools/generate-mixed-media.js';

// Initialize FastMCP server
const server = new FastMCP({
  name: "FeedMob AdPilot MCP",
  version: "1.0.0"
});

// Register tools
server.addTool(parseAdRequirementsTool);
server.addTool(conductAdResearchTool);
server.addTool(generateAdCopyTool);
server.addTool(generateAdImagesTool);
server.addTool(generateMixedMediaCreativeTool);

console.log('✅ Registered tools: parseAdRequirements, conductAdResearch, generateAdCopy, generateAdImages, generateMixedMediaCreative');

// Start server with HTTP streaming transport
server.start({
  transportType: "httpStream",
  httpStream: {
    port: 8080,
    endpoint: "/mcp"
  }
});

console.log('🚀 FeedMob AdPilot MCP Server started');
