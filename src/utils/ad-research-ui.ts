import { createUIResource } from '@mcp-ui/server';
import { CampaignReport } from '../schemas/ad-research.js';

/**
 * Creates a UIResource displaying comprehensive campaign research report
 */
export function createResearchReportUI(report: CampaignReport) {
  const { executive_summary, audience_insights, platform_strategy, creative_direction, 
          budget_allocation, performance_metrics, implementation_timeline, sources } = report;

  // Generate collapsible sections
  const executiveSummarySection = `
    <div class="report-section">
      <button class="section-header" onclick="toggleSection('executive-summary')">
        <span class="section-icon">📊</span>
        <span class="section-title">Executive Summary</span>
        <span class="toggle-icon">▼</span>
      </button>
      <div id="executive-summary" class="section-content">
        <div class="subsection">
          <h4>Overview</h4>
          <p>${executive_summary.overview}</p>
        </div>
        <div class="subsection">
          <h4>Key Findings</h4>
          <ul class="key-list">
            ${executive_summary.key_findings.map(f => `<li class="key-item">${f}</li>`).join('')}
          </ul>
        </div>
        <div class="subsection">
          <h4>Recommendations</h4>
          <ul class="key-list">
            ${executive_summary.recommendations.map(r => `<li class="key-item highlight">${r}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
  `;

  const audienceInsightsSection = `
    <div class="report-section">
      <button class="section-header" onclick="toggleSection('audience-insights')">
        <span class="section-icon">👥</span>
        <span class="section-title">Audience Insights</span>
        <span class="toggle-icon">▼</span>
      </button>
      <div id="audience-insights" class="section-content">
        <div class="insight-grid">
          <div class="insight-card">
            <h4>Demographics</h4>
            <p>${audience_insights.demographics}</p>
          </div>
          <div class="insight-card">
            <h4>Behaviors</h4>
            <p>${audience_insights.behaviors}</p>
          </div>
          <div class="insight-card">
            <h4>Preferences</h4>
            <p>${audience_insights.preferences}</p>
          </div>
          <div class="insight-card">
            <h4>Engagement Patterns</h4>
            <p>${audience_insights.engagement_patterns}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const platformStrategySection = `
    <div class="report-section">
      <button class="section-header" onclick="toggleSection('platform-strategy')">
        <span class="section-icon">📱</span>
        <span class="section-title">Platform Strategy</span>
        <span class="toggle-icon">▼</span>
      </button>
      <div id="platform-strategy" class="section-content">
        ${platform_strategy.map(ps => `
          <div class="platform-card">
            <h4 class="platform-name">${ps.platform}</h4>
            <div class="platform-detail">
              <strong>Trends:</strong> ${ps.trends}
            </div>
            <div class="platform-detail">
              <strong>Best Practices:</strong> ${ps.best_practices}
            </div>
            <div class="platform-detail">
              <strong>Optimization Tips:</strong> ${ps.optimization_tips}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const creativeDirectionSection = `
    <div class="report-section">
      <button class="section-header" onclick="toggleSection('creative-direction')">
        <span class="section-icon">🎨</span>
        <span class="section-title">Creative Direction</span>
        <span class="toggle-icon">▼</span>
      </button>
      <div id="creative-direction" class="section-content">
        <div class="subsection">
          <h4>Content Types</h4>
          <div class="tag-list">
            ${creative_direction.content_types.map(ct => `<span class="tag">${ct}</span>`).join('')}
          </div>
        </div>
        <div class="subsection">
          <h4>Format Recommendations</h4>
          <p>${creative_direction.format_recommendations}</p>
        </div>
        <div class="subsection">
          <h4>Tone & Style</h4>
          <p>${creative_direction.tone_and_style}</p>
        </div>
        <div class="subsection">
          <h4>Examples</h4>
          <ul class="example-list">
            ${creative_direction.examples.map(ex => `<li>${ex}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
  `;

  const budgetAllocationSection = `
    <div class="report-section">
      <button class="section-header" onclick="toggleSection('budget-allocation')">
        <span class="section-icon">💰</span>
        <span class="section-title">Budget Allocation</span>
        <span class="toggle-icon">▼</span>
      </button>
      <div id="budget-allocation" class="section-content">
        ${budget_allocation.total_budget ? `<div class="total-budget">Total Budget: <strong>${budget_allocation.total_budget}</strong></div>` : ''}
        <table class="budget-table">
          <thead>
            <tr>
              <th>Platform</th>
              <th>Allocation</th>
              <th>Rationale</th>
            </tr>
          </thead>
          <tbody>
            ${budget_allocation.distribution.map(d => `
              <tr>
                <td><strong>${d.platform}</strong></td>
                <td><span class="percentage">${d.percentage}%</span></td>
                <td>${d.rationale}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="subsection">
          <h4>Optimization Suggestions</h4>
          <p>${budget_allocation.optimization_suggestions}</p>
        </div>
      </div>
    </div>
  `;

  const performanceMetricsSection = `
    <div class="report-section">
      <button class="section-header" onclick="toggleSection('performance-metrics')">
        <span class="section-icon">📈</span>
        <span class="section-title">Performance Metrics</span>
        <span class="toggle-icon">▼</span>
      </button>
      <div id="performance-metrics" class="section-content">
        <div class="subsection">
          <h4>Primary KPIs</h4>
          <div class="tag-list">
            ${performance_metrics.primary_kpis.map(kpi => `<span class="tag kpi-tag">${kpi}</span>`).join('')}
          </div>
        </div>
        <table class="benchmark-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Industry Average</th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            ${performance_metrics.benchmarks.map(b => `
              <tr>
                <td><strong>${b.metric}</strong></td>
                <td>${b.industry_average}</td>
                <td class="target">${b.target}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="subsection">
          <h4>Tracking Recommendations</h4>
          <p>${performance_metrics.tracking_recommendations}</p>
        </div>
      </div>
    </div>
  `;

  const implementationTimelineSection = `
    <div class="report-section">
      <button class="section-header" onclick="toggleSection('implementation-timeline')">
        <span class="section-icon">📅</span>
        <span class="section-title">Implementation Timeline</span>
        <span class="toggle-icon">▼</span>
      </button>
      <div id="implementation-timeline" class="section-content">
        ${implementation_timeline.map((phase, idx) => `
          <div class="timeline-phase">
            <div class="phase-header">
              <span class="phase-number">${idx + 1}</span>
              <div class="phase-info">
                <h4>${phase.phase}</h4>
                <span class="phase-duration">${phase.duration}</span>
              </div>
            </div>
            <ul class="activity-list">
              ${phase.activities.map(a => `<li>${a}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const sourcesSection = `
    <div class="report-section">
      <button class="section-header" onclick="toggleSection('sources')">
        <span class="section-icon">🔗</span>
        <span class="section-title">Sources (${sources.length})</span>
        <span class="toggle-icon">▼</span>
      </button>
      <div id="sources" class="section-content collapsed">
        <ul class="source-list">
          ${sources.map(s => `
            <li class="source-item">
              <a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title}</a>
              <span class="source-date">${new Date(s.accessed_at).toLocaleDateString()}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `;

  const disclaimerSection = `
    <div class="disclaimer-section">
      <h4>⚖️ Copyright & Usage Disclaimer</h4>
      <p>${report.disclaimer}</p>
    </div>
  `;

  const actionButtons = `
    <div class="action-buttons">
      <button class="action-button primary" onclick="handleProceedToCopy()">
        Generate Ad Copy →
      </button>
      <button class="action-button secondary" onclick="handleExportReport()">
        Export Report
      </button>
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
        --accent-red: #ff3b30;
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
      .research-report-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        padding: 30px;
        background: var(--bg-secondary);
        border-radius: 12px;
        max-width: 1000px;
        margin: 0 auto;
        color: var(--text-primary);
      }
      .report-header {
        margin-bottom: 30px;
      }
      .report-title {
        font-size: 32px;
        font-weight: bold;
        margin-bottom: 10px;
        color: var(--text-primary);
      }
      .report-meta {
        font-size: 14px;
        color: var(--text-secondary);
      }
      .report-section {
        background: var(--bg-primary);
        border-radius: 10px;
        margin-bottom: 15px;
        overflow: hidden;
      }
      .section-header {
        width: 100%;
        padding: 18px 20px;
        background: var(--bg-tertiary);
        border: none;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: background 0.2s;
        color: var(--text-primary);
        font-size: 18px;
        font-weight: 600;
      }
      .section-header:hover {
        background: var(--bg-secondary);
      }
      .section-icon {
        font-size: 24px;
      }
      .section-title {
        flex: 1;
        text-align: left;
      }
      .toggle-icon {
        font-size: 14px;
        transition: transform 0.3s;
      }
      .section-header.collapsed .toggle-icon {
        transform: rotate(-90deg);
      }
      .section-content {
        padding: 20px;
        max-height: 2000px;
        overflow: hidden;
        transition: max-height 0.3s ease-out, padding 0.3s;
      }
      .section-content.collapsed {
        max-height: 0;
        padding: 0 20px;
      }
      .subsection {
        margin-bottom: 20px;
      }
      .subsection:last-child {
        margin-bottom: 0;
      }
      .subsection h4 {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 10px 0;
        color: var(--text-primary);
      }
      .subsection p {
        margin: 0;
        line-height: 1.6;
        color: var(--text-secondary);
      }
      .key-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .key-item {
        padding: 10px 15px;
        background: var(--bg-tertiary);
        border-radius: 6px;
        margin-bottom: 8px;
        color: var(--text-primary);
      }
      .key-item.highlight {
        border-left: 4px solid var(--accent-green);
      }
      .insight-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 15px;
      }
      .insight-card {
        background: var(--bg-tertiary);
        padding: 15px;
        border-radius: 8px;
      }
      .insight-card h4 {
        font-size: 14px;
        font-weight: 600;
        margin: 0 0 10px 0;
        color: var(--accent-blue);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .insight-card p {
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
        color: var(--text-secondary);
      }
      .platform-card {
        background: var(--bg-tertiary);
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 15px;
      }
      .platform-card:last-child {
        margin-bottom: 0;
      }
      .platform-name {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 12px 0;
        color: var(--accent-blue);
      }
      .platform-detail {
        margin-bottom: 10px;
        font-size: 14px;
        line-height: 1.5;
        color: var(--text-secondary);
      }
      .platform-detail:last-child {
        margin-bottom: 0;
      }
      .platform-detail strong {
        color: var(--text-primary);
      }
      .tag-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .tag {
        padding: 6px 12px;
        background: var(--bg-tertiary);
        border-radius: 20px;
        font-size: 13px;
        color: var(--text-primary);
        border: 1px solid var(--bg-secondary);
      }
      .kpi-tag {
        background: var(--accent-blue);
        color: white;
        border: none;
      }
      .example-list {
        list-style: disc;
        padding-left: 20px;
        margin: 0;
        color: var(--text-secondary);
      }
      .example-list li {
        margin-bottom: 6px;
        line-height: 1.5;
      }
      .total-budget {
        font-size: 18px;
        margin-bottom: 15px;
        padding: 12px;
        background: var(--bg-tertiary);
        border-radius: 6px;
        color: var(--text-primary);
      }
      .budget-table, .benchmark-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
      }
      .budget-table th, .benchmark-table th {
        text-align: left;
        padding: 10px;
        background: var(--bg-tertiary);
        font-weight: 600;
        font-size: 13px;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .budget-table td, .benchmark-table td {
        padding: 12px 10px;
        border-bottom: 1px solid var(--bg-tertiary);
        color: var(--text-secondary);
      }
      .budget-table tr:last-child td, .benchmark-table tr:last-child td {
        border-bottom: none;
      }
      .percentage {
        font-size: 18px;
        font-weight: 600;
        color: var(--accent-green);
      }
      .target {
        font-weight: 600;
        color: var(--accent-green);
      }
      .timeline-phase {
        background: var(--bg-tertiary);
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 15px;
      }
      .timeline-phase:last-child {
        margin-bottom: 0;
      }
      .phase-header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 12px;
      }
      .phase-number {
        width: 36px;
        height: 36px;
        background: var(--accent-blue);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 16px;
      }
      .phase-info h4 {
        margin: 0 0 4px 0;
        font-size: 16px;
        color: var(--text-primary);
      }
      .phase-duration {
        font-size: 13px;
        color: var(--text-tertiary);
      }
      .activity-list {
        list-style: disc;
        padding-left: 20px;
        margin: 0;
        color: var(--text-secondary);
      }
      .activity-list li {
        margin-bottom: 6px;
        line-height: 1.5;
      }
      .source-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .source-item {
        padding: 10px;
        background: var(--bg-tertiary);
        border-radius: 6px;
        margin-bottom: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .source-item a {
        color: var(--accent-blue);
        text-decoration: none;
        flex: 1;
      }
      .source-item a:hover {
        text-decoration: underline;
      }
      .source-date {
        font-size: 12px;
        color: var(--text-tertiary);
      }
      .disclaimer-section {
        background: var(--bg-tertiary);
        padding: 20px;
        border-radius: 10px;
        margin: 20px 0;
        border-left: 4px solid var(--accent-orange);
      }
      .disclaimer-section h4 {
        margin: 0 0 10px 0;
        font-size: 16px;
        color: var(--text-primary);
      }
      .disclaimer-section p {
        margin: 0;
        font-size: 14px;
        line-height: 1.6;
        color: var(--text-secondary);
      }
      .action-buttons {
        display: flex;
        gap: 15px;
        margin-top: 20px;
      }
      .action-button {
        flex: 1;
        padding: 15px 30px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .action-button.primary {
        background: var(--accent-green);
        color: white;
      }
      .action-button.secondary {
        background: var(--bg-tertiary);
        color: var(--text-primary);
      }
      .action-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      .action-button:active {
        transform: translateY(0);
      }
    </style>
    <div class="research-report-container">
      <div class="report-header">
        <div class="report-title">📊 Campaign Research Report</div>
        <div class="report-meta">
          ${report.campaign_name ? `<strong>${report.campaign_name}</strong> • ` : ''}
          Generated ${new Date(report.generated_at).toLocaleString()}
        </div>
      </div>
      
      ${executiveSummarySection}
      ${audienceInsightsSection}
      ${platformStrategySection}
      ${creativeDirectionSection}
      ${budgetAllocationSection}
      ${performanceMetricsSection}
      ${implementationTimelineSection}
      ${sourcesSection}
      ${disclaimerSection}
      ${actionButtons}
    </div>
    <script>
      function toggleSection(sectionId) {
        const content = document.getElementById(sectionId);
        const header = content.previousElementSibling;
        
        content.classList.toggle('collapsed');
        header.classList.toggle('collapsed');
      }

      function handleProceedToCopy() {
        window.parent.postMessage({
          type: 'tool',
          payload: {
            toolName: 'generateAdCopy',
            params: ${JSON.stringify({ campaignReport: report })}
          }
        }, '*');
      }

      function handleExportReport() {
        window.parent.postMessage({
          type: 'notify',
          payload: {
            message: 'Export functionality coming soon!'
          }
        }, '*');
      }

      // Collapse sources section by default
      document.addEventListener('DOMContentLoaded', () => {
        const sourcesContent = document.getElementById('sources');
        const sourcesHeader = sourcesContent.previousElementSibling;
        sourcesContent.classList.add('collapsed');
        sourcesHeader.classList.add('collapsed');
      });
    </script>
  `;

  return createUIResource({
    uri: `ui://campaign-research-report/${Date.now()}`,
    content: {
      type: 'rawHtml',
      htmlString: htmlContent
    },
    encoding: 'text',
    metadata: {
      title: 'Campaign Research Report',
      description: report.campaign_name || 'Comprehensive advertising research findings'
    }
  });
}


/**
 * Creates an error UIResource for research failures
 */
export function createResearchErrorUI(
  error: Error,
  errorType: 'validation' | 'agent' | 'search' | 'timeout' | 'unknown' = 'unknown'
) {
  const errorMessages = {
    validation: {
      title: 'Invalid Campaign Parameters',
      message: 'The campaign parameters could not be validated. Please check the input and try again.',
      icon: '⚠️'
    },
    agent: {
      title: 'Research Processing Error',
      message: 'We encountered an issue conducting the research. Please try again.',
      icon: '❌'
    },
    search: {
      title: 'Search Tool Error',
      message: 'Unable to gather research data from web search tools. Please try again.',
      icon: '🔍'
    },
    timeout: {
      title: 'Research Timeout',
      message: 'The research took too long to complete. Please try again.',
      icon: '⏱️'
    },
    unknown: {
      title: 'Unexpected Error',
      message: 'An unexpected error occurred during research. Please try again.',
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
            prompt: 'Please provide your campaign parameters again to retry research'
          }
        }, '*');
      }
    </script>
  `;

  return createUIResource({
    uri: `ui://research-error/${errorType}/${Date.now()}`,
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
