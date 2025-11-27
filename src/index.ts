import 'dotenv/config';
import { FastMCP } from 'fastmcp';
import { greetingTool } from './tools/greeting.js';
import { buttonTool } from './tools/button.js';
import { counterTool } from './tools/counter.js';
import { parseAdRequirementsTool } from './tools/parse-ad-requirements.js';
import { conductAdResearchTool } from './tools/conduct-ad-research.js';

// Initialize FastMCP server
const server = new FastMCP({
  name: "FeedMob AdPilot MCP",
  version: "1.0.0"
});

// Register tools
server.addTool(greetingTool);
server.addTool(buttonTool);
server.addTool(counterTool);
server.addTool(parseAdRequirementsTool);
server.addTool(conductAdResearchTool);

console.log('✅ Registered tools: greet, button, counter, parseAdRequirements, conductAdResearch');

// Start server with HTTP streaming transport
server.start({
  transportType: "httpStream",
  httpStream: {
    port: 8080,
    endpoint: "/mcp"
  }
});

console.log('🚀 FeedMob AdPilot MCP Server started');
