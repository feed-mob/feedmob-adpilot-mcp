import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { query, type SDKMessage, type SDKResultMessage } from '@anthropic-ai/claude-agent-sdk';
import { CampaignReport, CampaignReportSchema } from '../schemas/ad-research.js';
import { CampaignParameters } from '../schemas/campaign-params.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Service for interacting with Claude Agent SDK to conduct advertising research
 */
export class AdResearchAgent {
  /**
   * Conduct comprehensive advertising research based on campaign parameters
   * 
   * @param params - Campaign parameters from requirements parsing
   * @returns CampaignReport with research findings and recommendations
   * @throws Error if agent call fails or response cannot be parsed
   */
  async conductResearch(params: CampaignParameters): Promise<CampaignReport> {
    try {
      const pluginPath = this.resolvePluginPath();
      
      // Build campaign context for the prompt
      const campaignContext = this.buildCampaignContext(params);
      
      const prompt = `Use the "conduct-ad-research" skill to conduct comprehensive advertising research based on these confirmed campaign parameters:

${campaignContext}

Use available web search tools (DuckDuckGo or Tavily) to research:
1. Target audience demographics and behaviors
2. Platform-specific trends and best practices
3. Competitor strategies and successful examples
4. Industry benchmarks for the specified KPIs
5. Creative direction and format recommendations

Return a complete JSON campaign report with all required sections.`;

      const assistantSnippets: string[] = [];
      let resultMessage: SDKResultMessage | undefined;

      // Run the agent with plugin and web search tools
      for await (const message of query({
        prompt,
        options: {
          plugins: [{ type: 'local', path: pluginPath }],
          allowedTools: ['Skill', 'Read', 'WebSearch', 'mcp__duckduckgo__search', 'mcp__tavily__search'],
          maxTurns: 20,
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
      const validatedResult = CampaignReportSchema.parse(parsedResult);
      
      return validatedResult;
    } catch (error) {
      console.error('Error in conductResearch:', error);
      throw new Error(`Failed to conduct research: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
   * Resolve the path to the conduct-ad-research plugin
   */
  private resolvePluginPath(): string {
    // Primary path: src/plugins/conduct-ad-research
    const pluginPath = resolve(__dirname, '..', 'plugins', 'conduct-ad-research');
    
    // Check if plugin exists with valid manifest
    if (existsSync(pluginPath)) {
      const manifestPath = resolve(pluginPath, 'skills', 'conduct-ad-research', 'SKILL.md');
      if (existsSync(manifestPath)) {
        console.log(`✅ Found conduct-ad-research plugin at: ${pluginPath}`);
        return pluginPath;
      }
    }

    throw new Error(
      `conduct-ad-research plugin not found at expected location: ${pluginPath}. Expected structure: src/plugins/conduct-ad-research/skills/conduct-ad-research/SKILL.md`
    );
  }
}

/**
 * Singleton instance of the agent service
 */
export const adResearchAgent = new AdResearchAgent();
