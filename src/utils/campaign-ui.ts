import { createUIResource } from '@mcp-ui/server';
import { Campaign, getCampaignCompletionStatus } from '../schemas/campaign.js';

/**
 * Create a UIResource for displaying complete campaign data
 */
export function createCampaignUI(campaign: Campaign) {
  const status = getCampaignCompletionStatus(campaign);
  
  const htmlContent = `
    <style>
      :root {
        --bg-primary: #f5f5f5;
        --bg-secondary: #ededed;
        --bg-tertiary: #e6e6e6;
        --text-primary: #111;
        --text-secondary: #444;
        --text-tertiary: #666;
        --accent-blue: #0078ff;
        --accent-green: #0d9b45;
        --accent-orange: #ff9500;
        --accent-red: #ff3b30;
      }
      .container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        padding: 30px;
        background: var(--bg-secondary);
        border-radius: 12px;
        max-width: 900px;
        margin: 0 auto;
        color: var(--text-primary);
      }
      .header {
        margin-bottom: 25px;
        border-bottom: 1px solid var(--bg-tertiary);
        padding-bottom: 20px;
      }
      .title {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      .campaign-id-banner {
        background: var(--bg-tertiary);
        padding: 10px 15px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        gap: 8px;
        border: 1px solid var(--accent-blue);
        margin-bottom: 15px;
      }
      .campaign-id-label { font-weight: 600; color: var(--text-secondary); font-size: 13px; }
      .campaign-id-value {
        font-family: 'Courier New', monospace;
        background: var(--bg-primary);
        padding: 3px 6px;
        border-radius: 4px;
        font-size: 12px;
        color: var(--accent-blue);
        flex: 1;
      }
      .copy-btn {
        background: var(--accent-blue);
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
      }
      .copy-btn:hover { opacity: 0.9; }

      .status-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 600;
      }
      .status-complete { background: var(--accent-green); color: white; }
      .status-progress { background: var(--accent-orange); color: white; }
      .meta { font-size: 14px; color: var(--text-secondary); }
      .components-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 15px;
        margin-bottom: 25px;
      }
      .component-card {
        background: var(--bg-tertiary);
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid var(--text-tertiary);
      }
      .component-card.complete { border-left-color: var(--accent-green); }
      .component-card.pending { border-left-color: var(--accent-orange); }
      .component-name {
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .component-status { font-size: 18px; }
      .component-time { font-size: 12px; color: var(--text-tertiary); }
      .component-action {
        margin-top: 10px;
      }
      .action-btn {
        background: var(--accent-blue);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;
        width: 100%;
      }
      .action-btn:hover { opacity: 0.9; }
      .action-btn.secondary {
        background: var(--bg-primary);
        color: var(--text-primary);
        border: 1px solid var(--text-tertiary);
      }
    </style>
    <div class="container">
      <div class="header">
        <div class="title">📊 Campaign Overview</div>
        <div class="campaign-id-banner">
          <span class="campaign-id-label">Campaign ID:</span>
          <code class="campaign-id-value">${campaign.id}</code>
          <button class="copy-btn" onclick="copyToClipboard('${campaign.id}')">📋 Copy</button>
        </div>
        <div class="meta">
          <span class="status-badge ${status.isComplete ? 'status-complete' : 'status-progress'}">
            ${status.isComplete ? '✅ Complete' : '🔄 In Progress'}
          </span>
          <span style="margin-left: 15px;">Created: ${campaign.created_at.toLocaleString()}</span>
          <span style="margin-left: 15px;">Updated: ${campaign.updated_at.toLocaleString()}</span>
        </div>
      </div>
      
      <div class="components-grid">
        <div class="component-card ${status.hasParameters ? 'complete' : 'pending'}">
          <div class="component-name">
            <span class="component-status">${status.hasParameters ? '✅' : '❌'}</span>
            Parameters
          </div>
          ${campaign.parameters_updated_at ? `<div class="component-time">${campaign.parameters_updated_at.toLocaleString()}</div>` : ''}
          ${campaign.parameters?.campaign_name ? `<div style="margin-top:8px;font-size:13px;">Name: ${campaign.parameters.campaign_name}</div>` : ''}
          ${campaign.parameters?.platform ? `<div style="font-size:13px;">Platform: ${campaign.parameters.platform}</div>` : ''}
          <div class="component-action">
            <button class="action-btn ${status.hasParameters ? 'secondary' : ''}" onclick="updateParameters()">
              ${status.hasParameters ? 'Update' : 'Add'} Parameters
            </button>
          </div>
        </div>
        
        <div class="component-card ${status.hasResearch ? 'complete' : 'pending'}">
          <div class="component-name">
            <span class="component-status">${status.hasResearch ? '✅' : '❌'}</span>
            Research
          </div>
          ${campaign.research_updated_at ? `<div class="component-time">${campaign.research_updated_at.toLocaleString()}</div>` : ''}
          <div class="component-action">
            <button class="action-btn ${status.hasResearch ? 'secondary' : ''}" onclick="conductResearch()" ${!status.hasParameters ? 'disabled' : ''}>
              ${status.hasResearch ? 'Regenerate' : 'Conduct'} Research
            </button>
          </div>
        </div>
        
        <div class="component-card ${status.hasAdCopy ? 'complete' : 'pending'}">
          <div class="component-name">
            <span class="component-status">${status.hasAdCopy ? '✅' : '❌'}</span>
            Ad Copy
          </div>
          ${campaign.ad_copy_updated_at ? `<div class="component-time">${campaign.ad_copy_updated_at.toLocaleString()}</div>` : ''}
          ${campaign.selected_ad_copy_variation ? `<div style="margin-top:8px;font-size:13px;">Selected: Variation ${campaign.selected_ad_copy_variation}</div>` : ''}
          <div class="component-action">
            <button class="action-btn ${status.hasAdCopy ? 'secondary' : ''}" onclick="generateAdCopy()" ${!status.hasParameters ? 'disabled' : ''}>
              ${status.hasAdCopy ? 'Regenerate' : 'Generate'} Ad Copy
            </button>
          </div>
        </div>
        
        <div class="component-card ${status.hasImages ? 'complete' : 'pending'}">
          <div class="component-name">
            <span class="component-status">${status.hasImages ? '✅' : '❌'}</span>
            Images
          </div>
          ${campaign.images_updated_at ? `<div class="component-time">${campaign.images_updated_at.toLocaleString()}</div>` : ''}
          ${campaign.selected_image_variation ? `<div style="margin-top:8px;font-size:13px;">Selected: Variation ${campaign.selected_image_variation}</div>` : ''}
          <div class="component-action">
            <button class="action-btn ${status.hasImages ? 'secondary' : ''}" onclick="generateImages()" ${!status.hasParameters ? 'disabled' : ''}>
              ${status.hasImages ? 'Regenerate' : 'Generate'} Images
            </button>
          </div>
        </div>
        
        <div class="component-card ${status.hasMixedMedia ? 'complete' : 'pending'}">
          <div class="component-name">
            <span class="component-status">${status.hasMixedMedia ? '✅' : '❌'}</span>
            Mixed Media
          </div>
          ${campaign.mixed_media_updated_at ? `<div class="component-time">${campaign.mixed_media_updated_at.toLocaleString()}</div>` : ''}
          <div class="component-action">
            <button class="action-btn ${status.hasMixedMedia ? 'secondary' : ''}" onclick="generateMixedMedia()" ${!(status.hasAdCopy && status.hasImages) ? 'disabled' : ''}>
              ${status.hasMixedMedia ? 'Regenerate' : 'Generate'} Creative
            </button>
          </div>
        </div>
      </div>
    </div>
    <script>
      const CAMPAIGN_ID = '${campaign.id}';
      
      function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
          const btn = document.querySelector('.copy-btn');
          if (btn) {
            btn.textContent = '✓ Copied!';
            setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
          }
        });
      }
      
      function updateParameters() {
        window.parent.postMessage({
          type: 'prompt',
          payload: { prompt: 'Please provide updated campaign requirements for campaign ' + CAMPAIGN_ID }
        }, '*');
      }
      
      function conductResearch() {
        window.parent.postMessage({
          type: 'tool',
          payload: { toolName: 'conductAdResearch', params: { campaignId: CAMPAIGN_ID } }
        }, '*');
      }
      
      function generateAdCopy() {
        window.parent.postMessage({
          type: 'tool',
          payload: { toolName: 'generateAdCopy', params: { campaignId: CAMPAIGN_ID } }
        }, '*');
      }
      
      function generateImages() {
        window.parent.postMessage({
          type: 'tool',
          payload: { toolName: 'generateAdImages', params: { campaignId: CAMPAIGN_ID } }
        }, '*');
      }
      
      function generateMixedMedia() {
        window.parent.postMessage({
          type: 'tool',
          payload: { toolName: 'generateMixedMediaCreative', params: { campaignId: CAMPAIGN_ID } }
        }, '*');
      }
    </script>
  `;

  return createUIResource({
    uri: `ui://campaign/${campaign.id}`,
    content: { type: 'rawHtml', htmlString: htmlContent },
    encoding: 'text',
    metadata: {
      title: 'Campaign Overview',
      description: `Campaign ${campaign.id} - ${status.isComplete ? 'Complete' : 'In Progress'}`
    }
  });
}


/**
 * Create an error UI for campaign retrieval failures
 */
export function createCampaignErrorUI(
  error: Error,
  errorType: 'validation' | 'not_found' | 'unknown' = 'unknown'
) {
  const errorMessages = {
    validation: {
      title: 'Invalid Campaign ID',
      message: 'The campaign ID format is invalid. Please provide a valid UUID.',
      icon: '⚠️'
    },
    not_found: {
      title: 'Campaign Not Found',
      message: 'The specified campaign ID was not found in the database.',
      icon: '🔍'
    },
    unknown: {
      title: 'Unexpected Error',
      message: 'An unexpected error occurred while retrieving the campaign.',
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
        text-align: center;
        color: var(--text-primary);
      }
      .error-icon { font-size: 48px; margin-bottom: 15px; }
      .error-title { font-size: 24px; font-weight: bold; margin-bottom: 15px; }
      .error-message { font-size: 16px; color: var(--text-secondary); margin-bottom: 20px; }
      .error-details {
        background: var(--bg-primary);
        padding: 15px;
        border-radius: 8px;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        color: var(--text-secondary);
        word-break: break-word;
        margin-bottom: 20px;
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
        width: 100%;
      }
      .retry-button:hover { opacity: 0.9; }
    </style>
    <div class="error-container">
      <div class="error-icon">${errorInfo.icon}</div>
      <div class="error-title">${errorInfo.title}</div>
      <div class="error-message">${errorInfo.message}</div>
      <div class="error-details">${error.message}</div>
      <button class="retry-button" onclick="handleNewCampaign()">
        Start New Campaign
      </button>
    </div>
    <script>
      function handleNewCampaign() {
        window.parent.postMessage({
          type: 'prompt',
          payload: { prompt: 'Please provide your campaign requirements to start a new campaign.' }
        }, '*');
      }
    </script>
  `;

  return createUIResource({
    uri: `ui://campaign-error/${Date.now()}`,
    content: { type: 'rawHtml', htmlString: htmlContent },
    encoding: 'text',
    metadata: {
      title: errorInfo.title,
      description: `Error: ${error.message}`
    }
  });
}
