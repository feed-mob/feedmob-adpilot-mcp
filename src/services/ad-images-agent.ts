import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { query, type SDKMessage, type SDKResultMessage } from '@anthropic-ai/claude-agent-sdk';
import { AdImagesResult, AdImagesResultSchema, PLATFORM_DIMENSIONS } from '../schemas/ad-images.js';
import { CampaignParameters } from '../schemas/campaign-params.js';
import { CampaignReport } from '../schemas/ad-research.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Service for interacting with Claude Agent SDK to generate ad images
 */
export class AdImagesAgent {
  /**
   * Generate two distinct image variations based on campaign parameters
   * 
   * @param params - Campaign parameters from requirements parsing
   * @param research - Optional campaign research report with insights
   * @returns AdImagesResult with two variations and recommendation
   * @throws Error if agent call fails or response cannot be parsed
   */
  async generateImages(
    params: CampaignParameters,
    research?: CampaignReport
  ): Promise<AdImagesResult> {
    try {
      const pluginPath = this.resolvePluginPath();
      
      // Build campaign context for the prompt
      const campaignContext = this.buildCampaignContext(params);
      const researchContext = research ? this.buildResearchContext(research) : '';
      const dimensionsInfo = this.getPlatformDimensions(params.platform);
      
      const prompt = `Use the generate-ad-images skill to create two ad image variations for this campaign:

${campaignContext}
${researchContext ? `\n${researchContext}\n` : ''}
${dimensionsInfo}

Follow the skill workflow to generate both variations using the Python script, then return the final JSON result as specified in the skill.`;

      const assistantSnippets: string[] = [];
      let resultMessage: SDKResultMessage | undefined;

      // Run the agent with plugin - increased turns for image generation
      for await (const message of query({
        prompt,
        options: {
          plugins: [{ type: 'local', path: pluginPath }],
          allowedTools: ['Skill', 'Read', 'Bash'],
          maxTurns: 100,
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

      // Debug: Log what we received
      console.log('=== Agent Response Debug ===');
      console.log('Result message result:', resultMessage.result?.substring(0, 500));
      console.log('Assistant snippets count:', assistantSnippets.length);
      console.log('Combined response length:', responseText.length);
      console.log('Response preview:', responseText.substring(0, 1000));
      console.log('=== End Debug ===');

      // Extract JSON from the response - try multiple patterns
      let jsonMatch = responseText.match(/```json\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonMatch = [jsonMatch[1]]; // Extract content from code block
      } else {
        jsonMatch = responseText.match(/\{[\s\S]*\}/);
      }
      
      if (!jsonMatch) {
        throw new Error(`No JSON found in agent response. Response preview: ${responseText.substring(0, 500)}`);
      }

      const parsedResult = JSON.parse(jsonMatch[0]);
      
      // Validate against schema
      const validatedResult = AdImagesResultSchema.parse(parsedResult);
      
      return validatedResult;
    } catch (error) {
      console.error('Error in generateImages:', error);
      throw new Error(`Failed to generate ad images: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    lines.push(`- Content Types: ${research.creative_direction.content_types.join(', ')}`);
    
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
   * Get platform-specific dimensions information
   */
  private getPlatformDimensions(platform: string | null): string {
    if (!platform) {
      return 'Platform Dimensions: Use 1080x1080 (square format) as default';
    }

    const platformKey = platform.toLowerCase().replace(/\s+/g, '_');
    const dimensions = PLATFORM_DIMENSIONS[platformKey as keyof typeof PLATFORM_DIMENSIONS];

    if (dimensions) {
      return `Platform Dimensions: ${dimensions.width}x${dimensions.height} for ${platform}`;
    }

    return `Platform Dimensions: Use 1080x1080 (square format) for ${platform}`;
  }

  /**
   * Build runtime environment for the agent
   * Passes through necessary environment variables for Claude SDK and Gemini API
   */
  private buildRuntimeEnv(): NodeJS.ProcessEnv {
    const baseEnv = { ...process.env };

    // Ensure GOOGLE_API_KEY is available for Python script
    if (!baseEnv.GOOGLE_API_KEY) {
      console.warn('Warning: GOOGLE_API_KEY not set. Image generation may fail.');
    }

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
   * Resolve the path to the generate-ad-images plugin
   */
  private resolvePluginPath(): string {
    // Primary path: src/plugins/generate-ad-images
    const pluginPath = resolve(__dirname, '..', 'plugins', 'generate-ad-images');
    
    // Check if plugin exists with valid manifest
    if (existsSync(pluginPath)) {
      const manifestPath = resolve(pluginPath, 'skills', 'generate-ad-images', 'SKILL.md');
      if (existsSync(manifestPath)) {
        console.log(`✅ Found generate-ad-images plugin at: ${pluginPath}`);
        return pluginPath;
      }
    }

    throw new Error(
      `generate-ad-images plugin not found at expected location: ${pluginPath}. Expected structure: src/plugins/generate-ad-images/skills/generate-ad-images/SKILL.md`
    );
  }
}

/**
 * Singleton instance of the agent service
 */
export const adImagesAgent = new AdImagesAgent();
