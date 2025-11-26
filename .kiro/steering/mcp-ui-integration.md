---
inclusion: always
---

# MCP-UI Integration Guidelines

## Overview

This project uses **mcp-ui** to create interactive UI components within MCP responses. The mcp-ui SDK provides both server-side utilities (`@mcp-ui/server`) for creating UIResources and client-side components (`@mcp-ui/client`) for rendering them.

## Why MCP-UI?

MCP-UI enables:
- Rich, interactive UI components within MCP tool responses
- Secure rendering via sandboxed iframes
- Multiple content types (HTML, external URLs, Remote DOM)
- Interactive actions (tool calls, prompts, notifications, links)
- Consistent UI experience across MCP clients

## Installation

```bash
npm install @mcp-ui/server @mcp-ui/client
```

## Server-Side: Creating UIResources

### Basic UIResource Creation

```typescript
import { createUIResource } from '@mcp-ui/server';

const uiResource = createUIResource({
  uri: 'ui://campaign-params/123',
  content: { 
    type: 'rawHtml', 
    htmlString: '<h1>Campaign Parameters</h1>' 
  },
  encoding: 'text',
  metadata: {
    title: 'Campaign Parameters',
    description: 'Review your campaign settings'
  }
});
```

### Content Types

#### 1. Raw HTML (Inline HTML)

Best for: Simple, self-contained UI components

```typescript
const htmlContent = `
  <div style="font-family: sans-serif; padding: 20px;">
    <h2>Campaign Parameters</h2>
    <div class="param-group">
      <label>Budget:</label>
      <span>$5,000 USD</span>
    </div>
    <button onclick="window.parent.postMessage({
      type: 'tool',
      payload: { toolName: 'confirmCampaign', params: { campaignId: '123' } }
    }, '*')">Confirm</button>
  </div>
`;

const uiResource = createUIResource({
  uri: 'ui://campaign-params/123',
  content: { type: 'rawHtml', htmlString: htmlContent },
  encoding: 'text'
});
```

#### 2. External URL (Hosted UI)

Best for: Complex UIs, existing web apps, or when you need full control

```typescript
const uiResource = createUIResource({
  uri: 'ui://campaign-dashboard/123',
  content: { 
    type: 'externalUrl', 
    iframeUrl: 'https://adpilot.feedmob.com/campaign/123' 
  },
  encoding: 'text'
});
```

#### 3. Remote DOM (JavaScript-based UI)

Best for: Dynamic, component-based UIs with framework support

```typescript
const remoteDomScript = `
  const container = document.createElement('div');
  container.className = 'campaign-params';
  
  const title = document.createElement('h2');
  title.textContent = 'Campaign Parameters';
  container.appendChild(title);
  
  const button = document.createElement('button');
  button.textContent = 'Confirm';
  button.addEventListener('click', () => {
    window.parent.postMessage({
      type: 'tool',
      payload: { toolName: 'confirmCampaign', params: { campaignId: '123' } }
    }, '*');
  });
  container.appendChild(button);
  
  root.appendChild(container);
`;

const uiResource = createUIResource({
  uri: 'ui://campaign-params/123',
  content: {
    type: 'remoteDom',
    script: remoteDomScript,
    framework: 'react' // or 'webcomponents'
  },
  encoding: 'text'
});
```

## Interactive Actions

### Tool Calls

Trigger MCP tool execution from UI:

```javascript
window.parent.postMessage({
  type: 'tool',
  payload: {
    toolName: 'generateAdCopy',
    params: { campaignId: '123', variations: 3 }
  }
}, '*');
```

### Prompts

Request user input:

```javascript
window.parent.postMessage({
  type: 'prompt',
  payload: {
    prompt: 'Please provide additional details about your target audience'
  }
}, '*');
```

### Notifications

Show user notifications:

```javascript
window.parent.postMessage({
  type: 'notify',
  payload: {
    message: 'Campaign parameters saved successfully!'
  }
}, '*');
```

### Links

Open external links:

```javascript
window.parent.postMessage({
  type: 'link',
  payload: {
    url: 'https://docs.feedmob.com/campaigns'
  }
}, '*');
```

### Intents

Trigger high-level actions:

```javascript
window.parent.postMessage({
  type: 'intent',
  payload: {
    intent: 'edit-campaign',
    params: { campaignId: '123' }
  }
}, '*');
```

## Asynchronous Communication

For actions that need responses, use message IDs:

```javascript
const messageId = crypto.randomUUID();

window.parent.postMessage({
  type: 'tool',
  payload: {
    toolName: 'validateBudget',
    params: { amount: 5000, platform: 'TikTok' }
  },
  messageId: messageId
}, '*');

// Listen for response
window.addEventListener('message', (event) => {
  if (event.data.type === 'ui-message-response' && event.data.messageId === messageId) {
    if (event.data.success) {
      console.log('Validation result:', event.data.result);
    } else {
      console.error('Validation failed:', event.data.error);
    }
  }
});
```

## Metadata Configuration

Add metadata to improve UI rendering:

```typescript
const uiResource = createUIResource({
  uri: 'ui://campaign-params/123',
  content: { type: 'rawHtml', htmlString: htmlContent },
  encoding: 'text',
  metadata: {
    // Standard metadata
    title: 'Campaign Parameters',
    description: 'Review and confirm your campaign settings',
    created: new Date().toISOString(),
    author: 'AdPilot System',
    
    // UI-specific metadata
    preferredRenderContext: 'sidebar', // or 'main', 'modal'
    preferredFrameSize: ['800px', '600px'], // [width, height]
    initialRenderData: {
      theme: 'light',
      locale: 'en-US'
    }
  }
});
```

## Client-Side: Rendering UIResources

### React Integration

```tsx
import { UIResourceRenderer } from '@mcp-ui/client';

function CampaignView({ mcpResponse }) {
  const handleUIAction = async (action) => {
    if (action.type === 'tool') {
      // Call the MCP tool
      const result = await mcpClient.callTool(
        action.payload.toolName,
        action.payload.params
      );
      return { status: 'handled', result };
    }
    
    if (action.type === 'prompt') {
      // Show prompt to user
      const userInput = await showPrompt(action.payload.prompt);
      return { status: 'handled', input: userInput };
    }
    
    return { status: 'unhandled' };
  };

  return (
    <div>
      {mcpResponse.content.map((item, index) => {
        if (item.type === 'resource' && item.resource.uri?.startsWith('ui://')) {
          return (
            <UIResourceRenderer
              key={item.resource.uri}
              resource={item.resource}
              onUIAction={handleUIAction}
            />
          );
        }
        return <div key={index}>{item.text}</div>;
      })}
    </div>
  );
}
```

### Web Component Integration

```html
<ui-resource-renderer id="renderer"></ui-resource-renderer>

<script type="module">
  import '@mcp-ui/client/ui-resource-renderer.wc.js';
  
  const renderer = document.getElementById('renderer');
  renderer.resource = mcpResource.resource;
  
  renderer.addEventListener('onUIAction', async (event) => {
    const action = event.detail;
    
    if (action.type === 'tool') {
      const result = await callMCPTool(action.payload.toolName, action.payload.params);
      event.detail.respond({ status: 'handled', result });
    }
  });
</script>
```

## Best Practices

### 1. Use Semantic URIs

```typescript
// Good
uri: 'ui://campaign-params/123'
uri: 'ui://ad-copy/456/variations'
uri: 'ui://image-gallery/789'

// Bad
uri: 'ui://component1'
uri: 'ui://temp'
```

### 2. Include Inline Styles

Since UIResources render in sandboxed iframes, include all styles inline:

```typescript
const htmlContent = `
  <style>
    .campaign-params {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    .param-group {
      margin: 10px 0;
      padding: 10px;
      background: white;
      border-radius: 4px;
    }
    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background: #0056b3;
    }
  </style>
  <div class="campaign-params">
    <!-- content -->
  </div>
`;
```

### 3. Handle Errors Gracefully

```typescript
const htmlContent = `
  <div class="error-container">
    <h3>Unable to load campaign data</h3>
    <p>Please try again or contact support.</p>
    <button onclick="window.parent.postMessage({
      type: 'tool',
      payload: { toolName: 'retryCampaignLoad', params: {} }
    }, '*')">Retry</button>
  </div>
`;
```

### 4. Provide Loading States

```typescript
const htmlContent = `
  <div id="content">
    <div class="loading">Loading campaign data...</div>
  </div>
  <script>
    // Simulate loading
    setTimeout(() => {
      document.getElementById('content').innerHTML = '<h2>Campaign Ready!</h2>';
    }, 1000);
  </script>
`;
```

### 5. Use Descriptive Metadata

Always include title and description for better UX:

```typescript
metadata: {
  title: 'Campaign Parameters Review',
  description: 'Review your campaign settings before generating ad copy',
  preferredRenderContext: 'main'
}
```

## Common Patterns

### Editable Form

```typescript
const formHtml = `
  <style>
    .form-group { margin: 15px 0; }
    label { display: block; margin-bottom: 5px; font-weight: bold; }
    input, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
    button { margin-top: 20px; }
  </style>
  <form id="campaignForm">
    <div class="form-group">
      <label>Budget</label>
      <input type="number" name="budget" value="5000" />
    </div>
    <div class="form-group">
      <label>Platform</label>
      <select name="platform">
        <option value="tiktok">TikTok</option>
        <option value="facebook">Facebook</option>
        <option value="instagram">Instagram</option>
      </select>
    </div>
    <button type="submit">Update Campaign</button>
  </form>
  <script>
    document.getElementById('campaignForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      window.parent.postMessage({
        type: 'tool',
        payload: {
          toolName: 'updateCampaign',
          params: Object.fromEntries(formData)
        }
      }, '*');
    });
  </script>
`;
```

### Image Gallery with Actions

```typescript
const galleryHtml = `
  <style>
    .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
    .image-card { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
    .image-card img { width: 100%; height: 200px; object-fit: cover; }
    .image-actions { padding: 10px; display: flex; gap: 10px; }
    .image-actions button { flex: 1; padding: 8px; }
  </style>
  <div class="gallery">
    ${images.map(img => `
      <div class="image-card">
        <img src="${img.url}" alt="${img.alt}" />
        <div class="image-actions">
          <button onclick="selectImage('${img.id}')">Select</button>
          <button onclick="regenerateImage('${img.id}')">Regenerate</button>
        </div>
      </div>
    `).join('')}
  </div>
  <script>
    function selectImage(imageId) {
      window.parent.postMessage({
        type: 'tool',
        payload: { toolName: 'selectImage', params: { imageId } }
      }, '*');
    }
    function regenerateImage(imageId) {
      window.parent.postMessage({
        type: 'tool',
        payload: { toolName: 'regenerateImage', params: { imageId } }
      }, '*');
    }
  </script>
`;
```

### Progress Indicator

```typescript
const progressHtml = `
  <style>
    .progress-container { padding: 20px; }
    .progress-bar { width: 100%; height: 20px; background: #f0f0f0; border-radius: 10px; overflow: hidden; }
    .progress-fill { height: 100%; background: #007bff; transition: width 0.3s; }
  </style>
  <div class="progress-container">
    <h3>Generating Ad Copy...</h3>
    <div class="progress-bar">
      <div class="progress-fill" id="progress" style="width: 0%"></div>
    </div>
    <p id="status">Initializing...</p>
  </div>
  <script>
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      document.getElementById('progress').style.width = progress + '%';
      if (progress >= 100) {
        clearInterval(interval);
        document.getElementById('status').textContent = 'Complete!';
      }
    }, 500);
  </script>
`;
```

## Security Considerations

1. **Sandboxed Execution**: All UIResources render in sandboxed iframes
2. **No Direct DOM Access**: UI code cannot access parent window DOM
3. **Message-Based Communication**: All interactions use postMessage
4. **Content Security Policy**: External URLs must be whitelisted
5. **Input Validation**: Always validate data from UI actions

## Resources

- [mcp-ui GitHub](https://github.com/idosal/mcp-ui)
- [mcp-ui Documentation](https://mcpui.dev/)
- [Protocol Details](https://mcpui.dev/guide/protocol-details)
- [Client Usage Examples](https://mcpui.dev/guide/client/react-usage-examples)
