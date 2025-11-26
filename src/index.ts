import { FastMCP } from 'fastmcp';
import { greetingTool } from './tools/greeting.js';
import { buttonTool } from './tools/button.js';
import { counterTool } from './tools/counter.js';
import { parseAdRequirementsTool } from './tools/parse-ad-requirements.js';

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

console.log('✅ Registered tools: greet, button, counter, parseAdRequirements');

// Start server with HTTP streaming transport
server.start({
  transportType: "httpStream",
  httpStream: {
    port: 8080,
    endpoint: "/mcp"
  }
});

console.log('🚀 FeedMob AdPilot MCP Server started');
console.log('📍 MCP endpoint: http://localhost:8080/mcp');
console.log('📍 SSE endpoint: http://localhost:8080/sse');
console.log('📍 Health check: http://localhost:8080/ready');
console.log('');
console.log('💡 Test with: npx fastmcp inspect src/index.ts');
