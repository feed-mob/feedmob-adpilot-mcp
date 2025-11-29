import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { query, type SDKMessage, type SDKResultMessage } from '@anthropic-ai/claude-agent-sdk';
import { AdCopyResult, AdCopyResultSchema } from '../schemas/ad-copy.js';
import { CampaignParameters } from '../schemas/campaign-params.js';
import { CampaignReport } from '../schemas/ad-research.js';
import { resolvePluginPath } from '../utils/plugin-path.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Service for interacting with Claude Agent SDK to generate ad copy
 */
export class AdCopyAgent {
  /**
   * Generate two distinct ad copy variations based on campaign parameters
   * 
   * @param params - Campaign parameters from requirements parsing
   * @param research - Optional campaign research report with insights
   * @returns AdCopyResult with two variations and recommendation
   * @throws Error if agent call fails or response cannot be parsed
   */
  async generateCopy(
    params: CampaignParameters,
    research?: CampaignReport
  ): Promise<AdCopyResult> {
    try {
      const pluginPath = resolvePluginPath(__dirname, 'generate-ad-copy');
      
      // Build campaign context for the prompt
      const campaignContext = this.buildCampaignContext(params);
      const researchContext = research ? this.buildResearchContext(research) : '';
      
      const prompt = `Use the "generate-ad-copy" skill to generate two distinct ad copy variations based on these campaign parameters:

${campaignContext}

${researchContext}

Generate two distinct, creative, and copyright-compliant ad copy variations. Each variation should include:
- A compelling headline
- Engaging body copy
- A clear call-to-action

Ensure the variations are genuinely different in messaging approach, not just minor rewording.

Return a complete JSON object with both variations and your recommendation.`;

      const assistantSnippets: string[] = [];
      let resultMessage: SDKResultMessage | undefined;

      // Run the agent with plugin
      for await (const message of query({
        prompt,
        options: {
          plugins: [{ type: 'local', path: pluginPath }],
          allowedTools: ['Skill', 'Read'],
          maxTurns: 10,
          env: this.buildRuntimeEnv(),
        }
      })) {
        if (message.type === 'assistant') {
          const text = this.extractAssistantText(message);
          if (text) {
            assistantSnippets.push(text);
          }
        } else if (message.type === 'result') {
          resultMessage = message;
        }
      }

      if (!resultMessage) {
        throw new Error('Claude Agent SDK returned no result message');
      }

      if (resultMessage.subtype !== 'success') {
        const reason = Array.isArray(resultMessage.errors) && resultMessage.errors.length
          ? resultMessage.errors.join('; ')
          : `subtype ${resultMessage.subtype}`;
        throw new Error(`Claude Agent run failed: ${reason}`);
      }

      // Get the response text
      const responseText = (resultMessage.result || assistantSnippets.join('\n')).trim();

      // Extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in agent response');
      }

      const parsedResult = JSON.parse(jsonMatch[0]);
      
      // Validate against schema
      const validatedResult = AdCopyResultSchema.parse(parsedResult);
      
      return validatedResult;
    } catch (error) {
      console.error('Error in generateCopy:', error);
      throw new Error(`Failed to generate ad copy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build campaign context string from parameters
   */
  private buildCampaignContext(params: CampaignParameters): string {
    const lines: string[] = [];
    
    if (params.campaign_name) lines.push(`Campaign Name: ${params.campaign_name}`);
    if (params.product_or_service) lines.push(`Product/Service: ${params.product_or_service}`);
    if (params.product_or_service_url) lines.push(`Product URL: ${params.product_or_service_url}`);
    if (params.target_audience) lines.push(`Target Audience: ${params.target_audience}`);
    if (params.geography) lines.push(`Geography: ${params.geography}`);
    if (params.platform) lines.push(`Platform: ${params.platform}`);
    if (params.ad_format) lines.push(`Ad Format: ${params.ad_format}`);
    if (params.budget) lines.push(`Budget: ${params.budget}`);
    if (params.kpi) lines.push(`KPIs: ${params.kpi}`);
    if (params.time_period) lines.push(`Time Period: ${params.time_period}`);
    if (params.creative_direction) lines.push(`Creative Direction: ${params.creative_direction}`);
    if (params.other_details) lines.push(`Other Details: ${params.other_details}`);
    
    return lines.join('\n');
  }

  /**
   * Build research context string from campaign report
   */
  private buildResearchContext(research: CampaignReport): string {
    const lines: string[] = ['Research Insights:'];
    
    // Audience insights
    lines.push('\nAudience Insights:');
    lines.push(`- Demographics: ${research.audience_insights.demographics}`);
    lines.push(`- Behaviors: ${research.audience_insights.behaviors}`);
    lines.push(`- Preferences: ${research.audience_insights.preferences}`);
    
    // Creative direction from research
    lines.push('\nCreative Direction:');
    lines.push(`- Tone & Style: ${research.creative_direction.tone_and_style}`);
    lines.push(`- Format Recommendations: ${research.creative_direction.format_recommendations}`);
    
    // Platform strategy (first platform if multiple)
    if (research.platform_strategy.length > 0) {
      const primaryPlatform = research.platform_strategy[0];
      lines.push('\nPlatform Best Practices:');
      lines.push(`- Trends: ${primaryPlatform.trends}`);
      lines.push(`- Best Practices: ${primaryPlatform.best_practices}`);
    }
    
    return lines.join('\n');
  }

  /**
   * Build runtime environment for the agent
   * Passes through necessary environment variables for Claude SDK
   */
  private buildRuntimeEnv(): NodeJS.ProcessEnv {
    const baseEnv = { ...process.env };

    return baseEnv;
  }

  /**
   * Extract text content from assistant messages
   */
  private extractAssistantText(message: Extract<SDKMessage, { type: 'assistant' }>): string {
    const assistantMessage = message.message as any;
    const content = Array.isArray(assistantMessage?.content) ? assistantMessage.content : [];
    const textParts: string[] = [];

    for (const block of content) {
      if (typeof block === 'string') {
        textParts.push(block);
        continue;
      }

      if (block?.type === 'text' && typeof block.text === 'string') {
        textParts.push(block.text);
        continue;
      }

      if (block?.type === 'tool_result' && Array.isArray(block.content)) {
        for (const nested of block.content) {
          if (typeof nested === 'string') {
            textParts.push(nested);
          } else if (nested?.type === 'text' && typeof nested.text === 'string') {
            textParts.push(nested.text);
          }
        }
      }
    }

    return textParts.join('\n').trim();
  }

  /**
   * Resolve the path to the generate-ad-copy plugin
   */
}

/**
 * Singleton instance of the agent service
 */
export const adCopyAgent = new AdCopyAgent();
