import { createUIResource } from '@mcp-ui/server';

/**
 * Creates a greeting UIResource with personalized message and interactive button
 */
export function createGreetingUI(name: string) {
  const htmlContent = `
    <style>
      :root {
        --bg-primary: #f5f5f5;
        --bg-secondary: #ededed;
        --bg-tertiary: #e6e6e6;
        --text-primary: #111;
        --text-secondary: #444;
        --text-tertiary: #666;
        --icon-primary: #111;
        --accent-blue: #0078ff;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg-primary: #0f0f10;
          --bg-secondary: #1a1b1d;
          --bg-tertiary: #242529;
          --text-primary: #f5f5f5;
          --text-secondary: #c8c8cc;
          --text-tertiary: #9a9aa0;
          --icon-primary: #f5f5f5;
        }
      }
      .greeting-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        padding: 30px;
        background: var(--bg-secondary);
        border-radius: 12px;
        color: var(--text-primary);
        max-width: 500px;
        margin: 0 auto;
      }
      .greeting-title {
        font-size: 32px;
        font-weight: bold;
        margin-bottom: 10px;
        color: var(--text-primary);
      }
      .greeting-message {
        font-size: 18px;
        margin-bottom: 20px;
        color: var(--text-secondary);
      }
      .greeting-button {
        background: var(--accent-blue);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .greeting-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 120, 255, 0.3);
      }
      .greeting-button:active {
        transform: translateY(0);
      }
    </style>
    <div class="greeting-container">
      <div class="greeting-title">Hello, ${name}! 👋</div>
      <div class="greeting-message">Welcome to the MCP-UI FastMCP Demo!</div>
      <button class="greeting-button" onclick="handleButtonClick()">
        Click Me!
      </button>
    </div>
    <script>
      function handleButtonClick() {
        window.parent.postMessage({
          type: 'tool',
          payload: {
            toolName: 'button',
            params: {
              action: 'greeting-button-clicked',
              source: 'greeting-ui'
            }
          }
        }, '*');
      }
    </script>
  `;

  return createUIResource({
    uri: `ui://greeting/${encodeURIComponent(name)}`,
    content: {
      type: 'rawHtml',
      htmlString: htmlContent
    },
    encoding: 'text',
    metadata: {
      title: `Greeting for ${name}`,
      description: 'Personalized greeting with interactive button'
    }
  });
}

/**
 * Creates a button response UIResource showing the action that was performed
 */
export function createButtonResponseUI(action: string, source?: string) {
  const timestamp = new Date().toISOString();
  
  const htmlContent = `
    <style>
      :root {
        --bg-primary: #f5f5f5;
        --bg-secondary: #ededed;
        --bg-tertiary: #e6e6e6;
        --text-primary: #111;
        --text-secondary: #444;
        --text-tertiary: #666;
        --icon-primary: #111;
        --accent-green: #0d9b45;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg-primary: #0f0f10;
          --bg-secondary: #1a1b1d;
          --bg-tertiary: #242529;
          --text-primary: #f5f5f5;
          --text-secondary: #c8c8cc;
          --text-tertiary: #9a9aa0;
          --icon-primary: #f5f5f5;
        }
      }
      .button-response-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        padding: 25px;
        background: var(--bg-secondary);
        border: 2px solid var(--accent-green);
        border-radius: 10px;
        max-width: 500px;
        margin: 0 auto;
      }
      .response-icon {
        font-size: 48px;
        text-align: center;
        margin-bottom: 15px;
      }
      .response-title {
        font-size: 24px;
        font-weight: bold;
        color: var(--text-primary);
        text-align: center;
        margin-bottom: 15px;
      }
      .response-details {
        background: var(--bg-tertiary);
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 10px;
      }
      .response-label {
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 5px;
      }
      .response-value {
        color: var(--text-secondary);
        font-family: 'Courier New', monospace;
        background: var(--bg-primary);
        padding: 8px;
        border-radius: 4px;
        word-break: break-all;
      }
    </style>
    <div class="button-response-container">
      <div class="response-icon">✅</div>
      <div class="response-title">Button Action Received!</div>
      <div class="response-details">
        <div class="response-label">Action:</div>
        <div class="response-value">${action}</div>
      </div>
      ${source ? `
        <div class="response-details">
          <div class="response-label">Source:</div>
          <div class="response-value">${source}</div>
        </div>
      ` : ''}
      <div class="response-details">
        <div class="response-label">Timestamp:</div>
        <div class="response-value">${timestamp}</div>
      </div>
    </div>
  `;

  return createUIResource({
    uri: `ui://button-response/${Date.now()}`,
    content: {
      type: 'rawHtml',
      htmlString: htmlContent
    },
    encoding: 'text',
    metadata: {
      title: 'Button Action Response',
      description: `Response for action: ${action}`
    }
  });
}

/**
 * Creates a counter UIResource with increment and decrement buttons
 */
export function createCounterUI(count: number) {
  const htmlContent = `
    <style>
      :root {
        --bg-primary: #f5f5f5;
        --bg-secondary: #ededed;
        --bg-tertiary: #e6e6e6;
        --text-primary: #111;
        --text-secondary: #444;
        --text-tertiary: #666;
        --icon-primary: #111;
        --accent-blue: #0078ff;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg-primary: #0f0f10;
          --bg-secondary: #1a1b1d;
          --bg-tertiary: #242529;
          --text-primary: #f5f5f5;
          --text-secondary: #c8c8cc;
          --text-tertiary: #9a9aa0;
          --icon-primary: #f5f5f5;
        }
      }
      .counter-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        padding: 30px;
        background: var(--bg-secondary);
        border-radius: 12px;
        max-width: 400px;
        margin: 0 auto;
        text-align: center;
        color: var(--text-primary);
      }
      .counter-title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 20px;
        color: var(--text-primary);
      }
      .counter-display {
        font-size: 72px;
        font-weight: bold;
        margin: 30px 0;
        color: var(--text-primary);
      }
      .counter-buttons {
        display: flex;
        gap: 15px;
        justify-content: center;
      }
      .counter-button {
        background: var(--accent-blue);
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 8px;
        font-size: 24px;
        font-weight: bold;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        min-width: 80px;
      }
      .counter-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 120, 255, 0.3);
      }
      .counter-button:active {
        transform: translateY(0);
      }
    </style>
    <div class="counter-container">
      <div class="counter-title">Counter Demo</div>
      <div class="counter-display">${count}</div>
      <div class="counter-buttons">
        <button class="counter-button" onclick="handleDecrement()">−</button>
        <button class="counter-button" onclick="handleIncrement()">+</button>
      </div>
    </div>
    <script>
      function handleIncrement() {
        window.parent.postMessage({
          type: 'tool',
          payload: {
            toolName: 'counter',
            params: {
              count: ${count + 1}
            }
          }
        }, '*');
      }
      
      function handleDecrement() {
        window.parent.postMessage({
          type: 'tool',
          payload: {
            toolName: 'counter',
            params: {
              count: ${count - 1}
            }
          }
        }, '*');
      }
    </script>
  `;

  return createUIResource({
    uri: `ui://counter/${count}`,
    content: {
      type: 'rawHtml',
      htmlString: htmlContent
    },
    encoding: 'text',
    metadata: {
      title: 'Interactive Counter',
      description: `Counter with current value: ${count}`
    }
  });
}
