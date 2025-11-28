import { createUIResource } from '@mcp-ui/server';
import { AdCopyResult } from '../schemas/ad-copy.js';

/**
 * Creates a UIResource displaying two ad copy variations side-by-side
 */
export function createAdCopyUI(result: AdCopyResult, campaignId?: string) {
  const { variations, recommended_variation, recommendation_rationale, disclaimer } = result;
  
  // Find variations A and B
  const variationA = variations.find(v => v.variation_id === 'A');
  const variationB = variations.find(v => v.variation_id === 'B');
  
  if (!variationA || !variationB) {
    throw new Error('Both variations A and B must be present');
  }

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
        --accent-red: #ff3b30;
      }
      .ad-copy-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        padding: 30px;
        background: var(--bg-secondary);
        border-radius: 12px;
        max-width: 1200px;
        margin: 0 auto;
        color: var(--text-primary);
      }
      .header {
        margin-bottom: 30px;
      }
      .title {
        font-size: 32px;
        font-weight: bold;
        margin-bottom: 10px;
        color: var(--text-primary);
      }
      .meta {
        font-size: 14px;
        color: var(--text-secondary);
      }
      .campaign-id-banner {
        background: var(--bg-tertiary);
        padding: 10px 15px;
        border-radius: 6px;
        margin-top: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        border: 1px solid var(--accent-blue);
      }
      .campaign-id-label {
        font-weight: 600;
        color: var(--text-secondary);
        font-size: 13px;
      }
      .campaign-id-value {
        font-family: 'Courier New', monospace;
        background: var(--bg-primary);
        padding: 3px 6px;
        border-radius: 4px;
        font-size: 12px;
        color: var(--accent-blue);
      }
      .copy-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 14px;
        padding: 2px 6px;
      }
      .copy-btn:hover { opacity: 0.7; }
      .variations-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 30px;
      }
      @media (max-width: 768px) {
        .variations-grid {
          grid-template-columns: 1fr;
        }
      }
      .variation-card {
        background: var(--bg-primary);
        border-radius: 10px;
        padding: 25px;
        position: relative;
      }
      .variation-card.recommended {
        border: 2px solid var(--accent-green);
      }
      .variation-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
      }
      .variation-label {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-primary);
      }
      .recommended-badge {
        background: var(--accent-green);
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .copy-section {
        margin-bottom: 20px;
      }
      .copy-section:last-of-type {
        margin-bottom: 25px;
      }
      .copy-label {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-tertiary);
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .copy-content {
        font-size: 15px;
        line-height: 1.6;
        color: var(--text-primary);
        background: var(--bg-tertiary);
        padding: 12px 15px;
        border-radius: 6px;
      }
      .copy-content.headline {
        font-size: 18px;
        font-weight: 600;
      }
      .copy-content.cta {
        font-size: 16px;
        font-weight: 600;
        color: var(--accent-blue);
      }
      .select-button {
        width: 100%;
        padding: 14px 24px;
        background: var(--accent-blue);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .select-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 120, 255, 0.3);
      }
      .select-button:active {
        transform: translateY(0);
      }
      .select-button.recommended-btn {
        background: var(--accent-green);
      }
      .select-button.recommended-btn:hover {
        box-shadow: 0 4px 12px rgba(13, 155, 69, 0.3);
      }
      .recommendation-section {
        background: var(--bg-primary);
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 20px;
        border-left: 4px solid var(--accent-green);
      }
      .recommendation-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 10px;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .recommendation-text {
        font-size: 14px;
        line-height: 1.6;
        color: var(--text-secondary);
      }
      .disclaimer-section {
        background: var(--bg-tertiary);
        padding: 20px;
        border-radius: 10px;
        border-left: 4px solid var(--accent-orange);
        margin-bottom: 20px;
      }
      .disclaimer-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 10px;
        color: var(--text-primary);
      }
      .disclaimer-text {
        font-size: 14px;
        line-height: 1.6;
        color: var(--text-secondary);
      }
    </style>
    <div class="ad-copy-container">
      <div class="header">
        <div class="title">🎯 Ad Copy Variations</div>
        <div class="meta">
          ${result.campaign_name ? `<strong>${result.campaign_name}</strong> • ` : ''}
          ${result.platform ? `Platform: ${result.platform} • ` : ''}
          ${result.target_audience ? `Audience: ${result.target_audience} • ` : ''}
          Generated ${new Date(result.generated_at).toLocaleString()}
        </div>
        ${campaignId ? `
        <div class="campaign-id-banner">
          <span class="campaign-id-label">Campaign ID:</span>
          <code class="campaign-id-value">${campaignId}</code>
          <button class="copy-btn" onclick="copyToClipboard('${campaignId}')">📋</button>
        </div>
        ` : ''}
      </div>

      <div class="variations-grid">
        <!-- Variation A -->
        <div class="variation-card ${recommended_variation === 'A' ? 'recommended' : ''}">
          <div class="variation-header">
            <div class="variation-label">Variation A</div>
            ${recommended_variation === 'A' ? '<div class="recommended-badge">⭐ Recommended</div>' : ''}
          </div>

          <div class="copy-section">
            <div class="copy-label">📝 Headline</div>
            <div class="copy-content headline">${variationA.headline}</div>
          </div>

          <div class="copy-section">
            <div class="copy-label">📄 Body Copy</div>
            <div class="copy-content">${variationA.body_copy}</div>
          </div>

          <div class="copy-section">
            <div class="copy-label">🎯 Call to Action</div>
            <div class="copy-content cta">${variationA.cta}</div>
          </div>

          <button 
            class="select-button ${recommended_variation === 'A' ? 'recommended-btn' : ''}" 
            onclick="handleSelectVariation('A')"
          >
            Select Variation A
          </button>
        </div>

        <!-- Variation B -->
        <div class="variation-card ${recommended_variation === 'B' ? 'recommended' : ''}">
          <div class="variation-header">
            <div class="variation-label">Variation B</div>
            ${recommended_variation === 'B' ? '<div class="recommended-badge">⭐ Recommended</div>' : ''}
          </div>

          <div class="copy-section">
            <div class="copy-label">📝 Headline</div>
            <div class="copy-content headline">${variationB.headline}</div>
          </div>

          <div class="copy-section">
            <div class="copy-label">📄 Body Copy</div>
            <div class="copy-content">${variationB.body_copy}</div>
          </div>

          <div class="copy-section">
            <div class="copy-label">🎯 Call to Action</div>
            <div class="copy-content cta">${variationB.cta}</div>
          </div>

          <button 
            class="select-button ${recommended_variation === 'B' ? 'recommended-btn' : ''}" 
            onclick="handleSelectVariation('B')"
          >
            Select Variation B
          </button>
        </div>
      </div>

      <div class="recommendation-section">
        <div class="recommendation-title">💡 Our Recommendation</div>
        <div class="recommendation-text">
          <strong>Variation ${recommended_variation}</strong> is recommended. ${recommendation_rationale}
        </div>
      </div>

      <div class="disclaimer-section">
        <div class="disclaimer-title">⚖️ Copyright & Usage Disclaimer</div>
        <div class="disclaimer-text">${disclaimer}</div>
      </div>

    </div>
    <script>
      const CAMPAIGN_ID = ${campaignId ? `'${campaignId}'` : 'null'};

      function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
          const btn = document.querySelector('.copy-btn');
          if (btn) {
            btn.textContent = '✓';
            setTimeout(() => { btn.textContent = '📋'; }, 2000);
          }
        });
      }

      function handleSelectVariation(variationId) {
        const selectedVariation = variationId === 'A' 
          ? ${JSON.stringify(variationA)}
          : ${JSON.stringify(variationB)};

        // Store selection if we have a campaign ID
        if (CAMPAIGN_ID) {
          window.parent.postMessage({
            type: 'tool',
            payload: {
              toolName: 'generateAdImages',
              params: {
                campaignId: CAMPAIGN_ID,
                selectedAdCopy: selectedVariation
              }
            }
          }, '*');
        } else {
          window.parent.postMessage({
            type: 'tool',
            payload: {
              toolName: 'generateAdImages',
              params: {
                campaignParameters: {
                  product_or_service: null,
                  product_or_service_url: null,
                  campaign_name: ${JSON.stringify(result.campaign_name)},
                  target_audience: ${JSON.stringify(result.target_audience)},
                  geography: null,
                  ad_format: null,
                  budget: null,
                  platform: ${JSON.stringify(result.platform)},
                  kpi: null,
                  time_period: null,
                  creative_direction: selectedVariation.body_copy,
                  other_details: 'Selected ad copy: ' + selectedVariation.headline + ' | CTA: ' + selectedVariation.cta
                },
                selectedAdCopy: selectedVariation
              }
            }
          }, '*');
        }
      }
    </script>
  `;

  return createUIResource({
    uri: `ui://ad-copy-variations/${Date.now()}`,
    content: {
      type: 'rawHtml',
      htmlString: htmlContent
    },
    encoding: 'text',
    metadata: {
      title: 'Ad Copy Variations',
      description: result.campaign_name || 'Two ad copy variations for your campaign'
    }
  });
}

/**
 * Creates an error UIResource for ad copy generation failures
 */
export function createAdCopyErrorUI(
  error: Error,
  errorType: 'validation' | 'agent' | 'timeout' | 'not_found' | 'unknown' = 'unknown'
) {
  const errorMessages = {
    validation: {
      title: 'Invalid Input Parameters',
      message: 'The campaign parameters could not be validated. Please check the input and try again.',
      icon: '⚠️'
    },
    not_found: {
      title: 'Campaign Not Found',
      message: 'The specified campaign ID was not found. Please check the ID or create a new campaign.',
      icon: '🔍'
    },
    agent: {
      title: 'Ad Copy Generation Error',
      message: 'We encountered an issue generating ad copy. Please try again.',
      icon: '❌'
    },
    timeout: {
      title: 'Generation Timeout',
      message: 'Ad copy generation took too long to complete. Please try again.',
      icon: '⏱️'
    },
    unknown: {
      title: 'Unexpected Error',
      message: 'An unexpected error occurred during ad copy generation. Please try again.',
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
            prompt: 'Please provide your campaign parameters again to retry ad copy generation'
          }
        }, '*');
      }
    </script>
  `;

  return createUIResource({
    uri: `ui://ad-copy-error/${errorType}/${Date.now()}`,
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

