import { createUIResource } from '@mcp-ui/server';
import { AdImagesResult } from '../schemas/ad-images.js';

/**
 * Create a UIResource for displaying ad image variations
 * Shows both variations side-by-side with selection buttons
 */
export function createAdImagesUI(result: AdImagesResult) {
  const variationA = result.variations.find(v => v.variation_id === 'A');
  const variationB = result.variations.find(v => v.variation_id === 'B');

  if (!variationA || !variationB) {
    throw new Error('Both variations A and B are required');
  }

  const isARecommended = result.recommended_variation === 'A';

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
        --accent-green: #0d9b45;
        --accent-orange: #ff9500;
        --border-color: #ddd;
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
          --border-color: #444;
        }
      }

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
        background: var(--bg-primary);
        color: var(--text-primary);
        padding: 20px;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        background: var(--bg-secondary);
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .header {
        margin-bottom: 30px;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 20px;
      }

      .header-title {
        font-size: 24px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .header-meta {
        font-size: 14px;
        color: var(--text-secondary);
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .variations-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        margin-bottom: 30px;
      }

      @media (max-width: 768px) {
        .variations-grid {
          grid-template-columns: 1fr;
        }
      }

      .variation-card {
        background: var(--bg-tertiary);
        border-radius: 8px;
        padding: 20px;
        border: 2px solid var(--border-color);
        transition: border-color 0.2s;
      }

      .variation-card.recommended {
        border-color: var(--accent-green);
      }

      .variation-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }

      .variation-label {
        font-size: 18px;
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

      .image-container {
        width: 100%;
        background: var(--bg-primary);
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 300px;
      }

      .image-container img {
        width: 100%;
        height: auto;
        display: block;
      }

      .visual-approach {
        margin-bottom: 15px;
      }

      .visual-approach-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 6px;
      }

      .visual-approach-text {
        font-size: 14px;
        color: var(--text-primary);
        line-height: 1.5;
      }

      .dimensions {
        font-size: 12px;
        color: var(--text-tertiary);
        margin-bottom: 15px;
      }

      .select-button {
        width: 100%;
        padding: 12px 24px;
        background: var(--accent-blue);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
      }

      .select-button:hover {
        opacity: 0.9;
      }

      .select-button:active {
        opacity: 0.8;
      }

      .recommendation-section {
        background: var(--bg-tertiary);
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
        border-left: 4px solid var(--accent-green);
      }

      .recommendation-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .recommendation-text {
        font-size: 14px;
        color: var(--text-secondary);
        line-height: 1.6;
      }

      .regenerate-section {
        text-align: center;
        padding-top: 20px;
        border-top: 1px solid var(--border-color);
      }

      .regenerate-button {
        padding: 12px 32px;
        background: var(--bg-tertiary);
        color: var(--text-primary);
        border: 2px solid var(--border-color);
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .regenerate-button:hover {
        border-color: var(--accent-blue);
        color: var(--accent-blue);
      }
    </style>

    <div class="container">
      <div class="header">
        <div class="header-title">
          🖼️ Ad Image Variations
        </div>
        <div class="header-meta">
          ${result.campaign_name ? `<div class="meta-item"><strong>Campaign:</strong> ${result.campaign_name}</div>` : ''}
          ${result.platform ? `<div class="meta-item"><strong>Platform:</strong> ${result.platform}</div>` : ''}
          ${result.target_audience ? `<div class="meta-item"><strong>Audience:</strong> ${result.target_audience}</div>` : ''}
        </div>
      </div>

      <div class="recommendation-section">
        <div class="recommendation-title">
          💡 Recommendation
        </div>
        <div class="recommendation-text">
          ${result.recommendation_rationale}
        </div>
      </div>

      <div class="variations-grid">
        <div class="variation-card ${isARecommended ? 'recommended' : ''}">
          <div class="variation-header">
            <div class="variation-label">Variation A</div>
            ${isARecommended ? '<div class="recommended-badge">⭐ Recommended</div>' : ''}
          </div>
          
          <div class="image-container">
            <img src="data:${variationA.mime_type};base64,${variationA.image_data}" alt="Variation A" />
          </div>

          <div class="visual-approach">
            <div class="visual-approach-label">Visual Approach</div>
            <div class="visual-approach-text">${variationA.visual_approach}</div>
          </div>

          <div class="dimensions">
            📐 ${variationA.dimensions.width} × ${variationA.dimensions.height}
          </div>

          <button class="select-button" onclick="selectVariation('A')">
            Select Variation A
          </button>
        </div>

        <div class="variation-card ${!isARecommended ? 'recommended' : ''}">
          <div class="variation-header">
            <div class="variation-label">Variation B</div>
            ${!isARecommended ? '<div class="recommended-badge">⭐ Recommended</div>' : ''}
          </div>
          
          <div class="image-container">
            <img src="data:${variationB.mime_type};base64,${variationB.image_data}" alt="Variation B" />
          </div>

          <div class="visual-approach">
            <div class="visual-approach-label">Visual Approach</div>
            <div class="visual-approach-text">${variationB.visual_approach}</div>
          </div>

          <div class="dimensions">
            📐 ${variationB.dimensions.width} × ${variationB.dimensions.height}
          </div>

          <button class="select-button" onclick="selectVariation('B')">
            Select Variation B
          </button>
        </div>
      </div>

      <div class="regenerate-section">
        <button class="regenerate-button" onclick="regenerateImages()">
          🔄 Regenerate Both Variations
        </button>
      </div>
    </div>

    <script>
      function selectVariation(variationId) {
        const variation = variationId === 'A' ? ${JSON.stringify(variationA)} : ${JSON.stringify(variationB)};
        
        window.parent.postMessage({
          type: 'tool',
          payload: {
            toolName: 'generateMixedMediaCreative',
            params: {
              selectedImage: variation,
              platform: ${JSON.stringify(result.platform || 'instagram_feed')}
            }
          }
        }, '*');
      }

      function regenerateImages() {
        window.parent.postMessage({
          type: 'prompt',
          payload: {
            prompt: 'Would you like to regenerate the ad images with different variations?'
          }
        }, '*');
      }
    </script>
  `;

  return createUIResource({
    uri: `ui://ad-images/${Date.now()}`,
    content: { type: 'rawHtml', htmlString: htmlContent },
    encoding: 'text',
    metadata: {
      title: 'Ad Image Variations',
      description: `Two image variations for ${result.campaign_name || 'your campaign'}`
    }
  });
}

/**
 * Create an error UI for ad images generation failures
 */
export function createAdImagesErrorUI(
  error: Error,
  errorType: 'validation' | 'api' | 'timeout' | 'unknown' = 'unknown'
) {
  const errorMessages = {
    validation: {
      title: 'Invalid Input',
      message: 'The input parameters could not be validated.',
      icon: '⚠️'
    },
    api: {
      title: 'Image Generation Failed',
      message: 'We encountered an issue generating images with the Gemini API.',
      icon: '❌'
    },
    timeout: {
      title: 'Request Timeout',
      message: 'The image generation request took too long to process.',
      icon: '⏱️'
    },
    unknown: {
      title: 'Unexpected Error',
      message: 'An unexpected error occurred during image generation.',
      icon: '🔴'
    }
  };

  const errorInfo = errorMessages[errorType];

  const htmlContent = `
    <style>
      :root {
        --bg-primary: #f5f5f5;
        --bg-secondary: #ededed;
        --text-primary: #111;
        --text-secondary: #444;
        --accent-red: #ff3b30;
        --border-color: #ddd;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg-primary: #0f0f10;
          --bg-secondary: #1a1b1d;
          --text-primary: #f5f5f5;
          --text-secondary: #c8c8cc;
          --border-color: #444;
        }
      }

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: var(--bg-primary);
        color: var(--text-primary);
        padding: 20px;
      }

      .error-container {
        max-width: 600px;
        margin: 0 auto;
        background: var(--bg-secondary);
        border-radius: 12px;
        padding: 40px;
        text-align: center;
        border: 2px solid var(--accent-red);
      }

      .error-icon {
        font-size: 48px;
        margin-bottom: 20px;
      }

      .error-title {
        font-size: 24px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 12px;
      }

      .error-message {
        font-size: 16px;
        color: var(--text-secondary);
        margin-bottom: 20px;
        line-height: 1.5;
      }

      .error-details {
        background: var(--bg-primary);
        border-radius: 6px;
        padding: 15px;
        margin-bottom: 20px;
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 13px;
        color: var(--accent-red);
        text-align: left;
        word-break: break-word;
      }

      .retry-button {
        padding: 12px 32px;
        background: var(--accent-red);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
      }

      .retry-button:hover {
        opacity: 0.9;
      }
    </style>

    <div class="error-container">
      <div class="error-icon">${errorInfo.icon}</div>
      <div class="error-title">${errorInfo.title}</div>
      <div class="error-message">${errorInfo.message}</div>
      <div class="error-details">${error.message}</div>
      ${errorType !== 'validation' ? `
        <button class="retry-button" onclick="handleRetry()">Try Again</button>
      ` : ''}
    </div>

    <script>
      function handleRetry() {
        window.parent.postMessage({
          type: 'prompt',
          payload: {
            prompt: 'Please try generating the ad images again'
          }
        }, '*');
      }
    </script>
  `;

  return createUIResource({
    uri: `ui://ad-images-error/${errorType}/${Date.now()}`,
    content: { type: 'rawHtml', htmlString: htmlContent },
    encoding: 'text',
    metadata: {
      title: errorInfo.title,
      description: `Error: ${error.message}`
    }
  });
}
