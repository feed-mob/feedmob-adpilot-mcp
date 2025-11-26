import { query } from '@anthropic-ai/claude-agent-sdk';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginPath = path.resolve(__dirname, 'plugins/parse-ad-requirements');

console.log('Testing Claude Agent SDK with plugin...');
console.log('Plugin path:', pluginPath);
console.log('Plugin exists:', await import('fs').then(m => m.promises.access(pluginPath).then(() => true).catch(() => false)));
console.log('');

try {
  const prompt = 'Hello, can you see the parse-ad-requirements skill?';
  
  for await (const message of query({
    prompt,
    options: {
      plugins: [{ type: 'local', path: pluginPath }],
      maxTurns: 2,
    }
  })) {
    console.log('Message type:', message.type);
    
    if (message.type === 'system' && message.subtype === 'init') {
      console.log('Plugins loaded:', message.plugins);
      console.log('Skills available:', message.skills);
    }
    
    if (message.type === 'assistant') {
      console.log('Assistant response received');
    }
    
    if (message.type === 'result') {
      console.log('Result:', message.subtype);
      if (message.errors) {
        console.log('Errors:', message.errors);
      }
    }
  }
  
  console.log('\n✅ Test completed successfully');
} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
}
