# Quick Start Guide

Get the MCP-UI Chat Client running in 5 minutes!

## Step 1: Configure Environment

Edit the `.env` file in the `client-ui/client-ui` directory with your actual credentials:

```bash
cd client-ui/client-ui
# Edit .env file
```

**Important:** Replace the placeholder values with your actual credentials:

```env
# AWS Bedrock Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=us.anthropic.claude-haiku-4-5-20251001-v1:0

# MCP Server Configuration
MCP_SERVER_URL=http://localhost:8080/mcp
```

## Step 2: Start Your MCP Server

**Important:** The AdPilot MCP server must be running before starting the chat client.

```bash
# In the main project directory (feedmob_adpilot_mcp)
cd ../..
npm run dev
```

Wait for the message: `🚀 FeedMob AdPilot MCP Server started on http://0.0.0.0:8080/mcp`

The server should be running at `http://localhost:8080/mcp`

**Note:** If you skip this step, the chat client will still work for basic AI chat, but MCP tools won't be available.

## Step 3: Install Dependencies

```bash
# In client-ui/client-ui directory
npm install
```

## Step 4: Run the Chat Client

```bash
npm run dev
```

## Step 5: Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

You should see:
- ✅ "Connected to MCP server (X tools available)" - Green status
- A chat input at the bottom
- Empty message area ready for your first message

## Try It Out!

1. **Test basic chat:**
   ```
   Hello! Can you help me create an ad campaign?
   ```

2. **Test MCP tools:**
   ```
   I want to create a TikTok campaign with a $5000 budget targeting young adults interested in fitness
   ```

3. **See UIResources:**
   The AI will call MCP tools that return interactive UI components showing:
   - Campaign parameters
   - Ad copy variations
   - Research results
   - Generated images

## Troubleshooting

### "MCP Server Error"
- Check that your MCP server is running on port 8080
- Verify `MCP_SERVER_URL` in `.env` is correct
- Check server logs for errors

### "AWS Bedrock is not configured"
- Verify your AWS credentials in `.env`
- Ensure your AWS account has Bedrock access
- Check that the region supports Claude models

### Port 3000 already in use
```bash
# Use a different port
PORT=3001 npm run dev
```

### Build errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

## Next Steps

- Explore the chat history sidebar (History button)
- Try different MCP tools
- Interact with UIResource components
- Create multiple chat sessions

## Development

Run tests:
```bash
npm test
```

Type checking:
```bash
npm run typecheck
```

Build for production:
```bash
npm run build
npm start
```

## Need Help?

Check the full [README.md](./README.md) for:
- Detailed architecture
- Component documentation
- API reference
- Advanced configuration
