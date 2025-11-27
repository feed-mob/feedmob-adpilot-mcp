import { createUIResource } from '@mcp-ui/server';
import { MixedMediaResult } from '../schemas/mixed-media.js';

/**
 * Create a UIResource for displaying mixed media creative preview
 * Shows composite image with ad copy overlay and export options
 */
export function createMixedMediaUI(result: MixedMediaResult) {
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
        max-width: 900px;
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

      .preview-section {
        margin-bottom: 30px;
      }

      .preview-label {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 15px;
      }

      .preview-container {
        background: var(--bg-tertiary);
        border-radius: 8px;
        padding: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .composite-wrapper {
        position: relative;
        max-width: 100%;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .composite-image {
        width: 100%;
        height: auto;
        display: block;
      }

      .copy-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
        padding: 30px 20px 20px;
        color: white;
      }

      .copy-headline {
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 10px;
        line-height: 1.2;
      }

      .copy-body {
        font-size: 14px;
        margin-bottom: 15px;
        line-height: 1.5;
        opacity: 0.95;
      }

      .copy-cta {
        display: inline-block;
        background: white;
        color: #111;
        padding: 10px 24px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
      }

      .details-section {
        background: var(--bg-tertiary);
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
      }

      .details-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
      }

      .detail-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .detail-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .detail-value {
        font-size: 14px;
        color: var(--text-primary);
      }

      .actions-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin-bottom: 20px;
      }

      @media (max-width: 600px) {
        .actions-section {
          grid-template-columns: 1fr;
        }
      }

      .action-button {
        padding: 14px 24px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .action-button:hover {
        opacity: 0.9;
      }

      .action-button.primary {
        background: var(--accent-blue);
        color: white;
      }

      .action-button.secondary {
        background: var(--bg-tertiary);
        color: var(--text-primary);
        border: 2px solid var(--border-color);
      }

      .regenerate-section {
        padding-top: 20px;
        border-top: 1px solid var(--border-color);
        display: flex;
        gap: 15px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .regenerate-button {
        padding: 12px 24px;
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
          🎨 Mixed Media Creative Preview
        </div>
        <div class="header-meta">
          <div class="meta-item"><strong>Platform:</strong> ${result.platform}</div>
          <div class="meta-item"><strong>Format:</strong> ${result.dimensions.width}×${result.dimensions.height}</div>
          <div class="meta-item"><strong>Source:</strong> Variation ${result.source_image_variation}</div>
        </div>
      </div>

      <div class="preview-section">
        <div class="preview-label">Creative Preview</div>
        <div class="preview-container">
          <div class="composite-wrapper">
            <img 
              class="composite-image" 
              src="${result.composite_image_url}" 
              alt="Mixed Media Creative"
            />
            <div class="copy-overlay">
              <div class="copy-headline">${result.ad_copy_used.headline}</div>
              <div class="copy-body">${result.ad_copy_used.body_copy}</div>
              <div class="copy-cta">${result.ad_copy_used.cta}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="details-section">
        <div class="details-grid">
          <div class="detail-item">
            <div class="detail-label">Headline</div>
            <div class="detail-value">${result.ad_copy_used.headline}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Body Copy</div>
            <div class="detail-value">${result.ad_copy_used.body_copy}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Call to Action</div>
            <div class="detail-value">${result.ad_copy_used.cta}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Dimensions</div>
            <div class="detail-value">${result.dimensions.width} × ${result.dimensions.height}</div>
          </div>
        </div>
      </div>

      <div class="actions-section">
        <button class="action-button primary" onclick="downloadPNG()">
          📥 Download PNG
        </button>
        <button class="action-button primary" onclick="downloadJPEG()">
          📥 Download JPEG
        </button>
      </div>

      <div class="regenerate-section">
        <button class="regenerate-button" onclick="tryDifferentCopy()">
          📝 Try Different Copy
        </button>
        <button class="regenerate-button" onclick="tryDifferentImage()">
          🖼️ Try Different Image
        </button>
      </div>
    </div>

    <script>
      function downloadPNG() {
        const link = document.createElement('a');
        link.href = '${result.composite_image_url}';
        link.download = 'ad-creative-${result.platform}-${Date.now()}.png';
        link.target = '_blank';
        link.click();
      }

      function downloadJPEG() {
        const link = document.createElement('a');
        link.href = '${result.composite_image_url}';
        link.download = 'ad-creative-${result.platform}-${Date.now()}.jpg';
        link.target = '_blank';
        link.click();
      }

      function tryDifferentCopy() {
        window.parent.postMessage({
          type: 'prompt',
          payload: {
            prompt: 'Would you like to generate different ad copy for this image?'
          }
        }, '*');
      }

      function tryDifferentImage() {
        window.parent.postMessage({
          type: 'prompt',
          payload: {
            prompt: 'Would you like to try a different image variation?'
          }
        }, '*');
      }
    </script>
  `;

  return createUIResource({
    uri: `ui://mixed-media/${Date.now()}`,
    content: { type: 'rawHtml', htmlString: htmlContent },
    encoding: 'text',
    metadata: {
      title: 'Mixed Media Creative',
      description: `${result.platform} ad creative with copy overlay`
    }
  });
}

/**
 * Create an error UI for mixed media generation failures
 */
export function createMixedMediaErrorUI(
  error: Error,
  errorType: 'validation' | 'generation' | 'unknown' = 'unknown'
) {
  const errorMessages = {
    validation: {
      title: 'Invalid Input',
      message: 'The input parameters could not be validated.',
      icon: '⚠️'
    },
    generation: {
      title: 'Generation Failed',
      message: 'We encountered an issue generating the mixed media creative.',
      icon: '❌'
    },
    unknown: {
      title: 'Unexpected Error',
      message: 'An unexpected error occurred during generation.',
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
            prompt: 'Please try generating the mixed media creative again'
          }
        }, '*');
      }
    </script>
  `;

  return createUIResource({
    uri: `ui://mixed-media-error/${errorType}/${Date.now()}`,
    content: { type: 'rawHtml', htmlString: htmlContent },
    encoding: 'text',
    metadata: {
      title: errorInfo.title,
      description: `Error: ${error.message}`
    }
  });
}
