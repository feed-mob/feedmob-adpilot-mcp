import { createUIResource } from '@mcp-ui/server';
import { ValidationResult, CampaignParameters } from '../schemas/campaign-params.js';

/**
 * Field labels for display
 */
const FIELD_LABELS: Record<keyof CampaignParameters, string> = {
  product_or_service: 'Product/Service',
  product_or_service_url: 'Product URL',
  campaign_name: 'Campaign Name',
  target_audience: 'Target Audience',
  geography: 'Geography',
  ad_format: 'Ad Format',
  budget: 'Budget',
  platform: 'Platform',
  kpi: 'KPIs',
  time_period: 'Time Period',
  creative_direction: 'Creative Direction',
  other_details: 'Other Details'
};

/**
 * Creates a UIResource displaying campaign parameters
 */
export function createParametersUI(result: ValidationResult) {
  const { parameters } = result;
  const validFieldNames = Object.keys(FIELD_LABELS);
  const missingFields = result.missingFields
    .filter(f => f.trim() !== '')
    .filter(f => validFieldNames.includes(f));
  const success = missingFields.length === 0;
  
  const parameterCards = Object.entries(parameters)
    .map(([key, value]) => {
      const isMissing = missingFields.includes(key);
      const label = FIELD_LABELS[key as keyof CampaignParameters] || key;
      const displayValue = value || '<em>Not specified</em>';
      
      return `
        <div class="param-card ${isMissing ? 'missing-field' : ''}">
          <div class="param-label">${label}</div>
          <div class="param-value">${displayValue}</div>
        </div>
      `;
    })
    .join('');

  const confirmButton = success ? `
    <button class="confirm-button" onclick="handleConfirm()">
      ✓ Confirm and Proceed
    </button>
  ` : `
    <div class="missing-notice">
      <strong>Missing Information:</strong> ${missingFields.length} field(s) need to be specified
    </div>
  `;

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
        --accent-orange: #ff9500;
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
      .parameters-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        padding: 30px;
        background: var(--bg-secondary);
        border-radius: 12px;
        max-width: 800px;
        margin: 0 auto;
        color: var(--text-primary);
      }
      .parameters-title {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 10px;
        color: var(--text-primary);
      }
      .parameters-subtitle {
        font-size: 16px;
        color: var(--text-secondary);
        margin-bottom: 25px;
      }
      .param-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 15px;
        margin-bottom: 25px;
      }
      .param-card {
        background: var(--bg-tertiary);
        padding: 15px;
        border-radius: 8px;
        border: 2px solid transparent;
        transition: border-color 0.2s;
      }
      .param-card.missing-field {
        border-color: var(--accent-orange);
        background: var(--bg-primary);
      }
      .param-label {
        font-weight: 600;
        font-size: 14px;
        color: var(--text-secondary);
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .param-value {
        font-size: 16px;
        color: var(--text-primary);
        word-break: break-word;
      }
      .param-value em {
        color: var(--text-tertiary);
        font-style: italic;
      }
      .confirm-button {
        background: var(--accent-green);
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        width: 100%;
      }
      .confirm-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(13, 155, 69, 0.3);
      }
      .confirm-button:active {
        transform: translateY(0);
      }
      .missing-notice {
        background: var(--bg-tertiary);
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid var(--accent-orange);
        color: var(--text-primary);
      }
    </style>
    <div class="parameters-container">
      <div class="parameters-title">📋 Campaign Parameters</div>
      <div class="parameters-subtitle">
        ${success ? 'All information collected!' : `${missingFields.length} field(s) still need information`}
      </div>
      <div class="param-grid">
        ${parameterCards}
      </div>
      ${confirmButton}
    </div>
    <script>
      function handleConfirm() {
        window.parent.postMessage({
          type: 'tool',
          payload: {
            toolName: 'confirmCampaignParameters',
            params: ${JSON.stringify(parameters)}
          }
        }, '*');
      }
    </script>
  `;

  return createUIResource({
    uri: `ui://campaign-parameters/${Date.now()}`,
    content: {
      type: 'rawHtml',
      htmlString: htmlContent
    },
    encoding: 'text',
    metadata: {
      title: 'Campaign Parameters',
      description: success ? 'Complete campaign parameters' : `${missingFields.length} fields missing`
    }
  });
}

/**
 * Creates a UIResource for prompting about a missing field
 */
export function createMissingFieldUI(field: string, examples: string[]) {
  const label = FIELD_LABELS[field as keyof CampaignParameters] || field;
  
  const examplesList = examples.map(ex => `<li>${ex}</li>`).join('');

  const htmlContent = `
    <style>
      :root {
        --bg-primary: #f5f5f5;
        --bg-secondary: #ededed;
        --bg-tertiary: #e6e6e6;
        --text-primary: #111;
        --text-secondary: #444;
        --text-tertiary: #666;
        --accent-orange: #ff9500;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg-primary: #0f0f10;
          --bg-secondary: #1a1b1d;
          --bg-tertiary: #242529;
          --text-primary: #f5f5f5;
          --text-secondary: #c8c8cc;
          --text-tertiary: #9a9aa0;
        }
      }
      .missing-field-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        padding: 25px;
        background: var(--bg-secondary);
        border-radius: 10px;
        border-left: 4px solid var(--accent-orange);
        max-width: 600px;
        margin: 0 auto;
        color: var(--text-primary);
      }
      .missing-field-title {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 15px;
        color: var(--text-primary);
      }
      .missing-field-examples {
        background: var(--bg-tertiary);
        padding: 15px;
        border-radius: 8px;
        margin-top: 15px;
      }
      .missing-field-examples h4 {
        margin: 0 0 10px 0;
        font-size: 14px;
        color: var(--text-secondary);
        text-transform: uppercase;
      }
      .missing-field-examples ul {
        margin: 0;
        padding-left: 20px;
        color: var(--text-primary);
      }
      .missing-field-examples li {
        margin: 5px 0;
      }
    </style>
    <div class="missing-field-container">
      <div class="missing-field-title">ℹ️ Missing: ${label}</div>
      <p>Please provide information about <strong>${label.toLowerCase()}</strong> for your campaign.</p>
      ${examples.length > 0 ? `
        <div class="missing-field-examples">
          <h4>Examples:</h4>
          <ul>${examplesList}</ul>
        </div>
      ` : ''}
    </div>
  `;

  return createUIResource({
    uri: `ui://missing-field/${field}/${Date.now()}`,
    content: {
      type: 'rawHtml',
      htmlString: htmlContent
    },
    encoding: 'text',
    metadata: {
      title: `Missing: ${label}`,
      description: `Prompt for missing ${label} field`
    }
  });
}

/**
 * Creates an error UIResource
 */
export function createErrorUI(error: Error, errorType: 'validation' | 'agent' | 'timeout' | 'unknown' = 'unknown') {
  const errorMessages = {
    validation: {
      title: 'Invalid Input',
      message: 'The campaign request could not be validated. Please check your input and try again.',
      icon: '⚠️'
    },
    agent: {
      title: 'Processing Error',
      message: 'We encountered an issue processing your request. Please try again.',
      icon: '❌'
    },
    timeout: {
      title: 'Request Timeout',
      message: 'The request took too long to process. Please try again with a simpler description.',
      icon: '⏱️'
    },
    unknown: {
      title: 'Unexpected Error',
      message: 'An unexpected error occurred. Please try again.',
      icon: '🔴'
    }
  };

  const errorInfo = errorMessages[errorType];

  const htmlContent = `
    <style>
      :root {
        --bg-primary: #f5f5f5;
        --bg-secondary: #ededed;
        --bg-tertiary: #e6e6e6;
        --text-primary: #111;
        --text-secondary: #444;
        --accent-red: #ff3b30;
        --accent-blue: #0078ff;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg-primary: #0f0f10;
          --bg-secondary: #1a1b1d;
          --bg-tertiary: #242529;
          --text-primary: #f5f5f5;
          --text-secondary: #c8c8cc;
        }
      }
      .error-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        padding: 30px;
        background: var(--bg-secondary);
        border: 2px solid var(--accent-red);
        border-radius: 12px;
        max-width: 500px;
        margin: 0 auto;
        color: var(--text-primary);
      }
      .error-icon {
        font-size: 48px;
        text-align: center;
        margin-bottom: 15px;
      }
      .error-title {
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 15px;
        color: var(--text-primary);
      }
      .error-message {
        font-size: 16px;
        text-align: center;
        margin-bottom: 20px;
        color: var(--text-secondary);
      }
      .error-details {
        background: var(--bg-tertiary);
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        color: var(--text-secondary);
        word-break: break-word;
      }
      .retry-button {
        background: var(--accent-blue);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        width: 100%;
      }
      .retry-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 120, 255, 0.3);
      }
      .retry-button:active {
        transform: translateY(0);
      }
    </style>
    <div class="error-container">
      <div class="error-icon">${errorInfo.icon}</div>
      <div class="error-title">${errorInfo.title}</div>
      <div class="error-message">${errorInfo.message}</div>
      <div class="error-details">${error.message}</div>
      ${errorType !== 'validation' ? `
        <button class="retry-button" onclick="handleRetry()">
          Try Again
        </button>
      ` : ''}
    </div>
    <script>
      function handleRetry() {
        window.parent.postMessage({
          type: 'prompt',
          payload: {
            prompt: 'Please provide your campaign requirements again'
          }
        }, '*');
      }
    </script>
  `;

  return createUIResource({
    uri: `ui://error/${errorType}/${Date.now()}`,
    content: {
      type: 'rawHtml',
      htmlString: htmlContent
    },
    encoding: 'text',
    metadata: {
      title: errorInfo.title,
      description: `Error: ${error.message}`
    }
  });
}
