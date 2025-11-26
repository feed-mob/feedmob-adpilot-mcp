import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { query, type SDKMessage, type SDKResultMessage } from '@anthropic-ai/claude-agent-sdk';
import { ValidationResult, ValidationResultSchema } from '../schemas/campaign-params.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Service for interacting with Claude Agent SDK to parse advertising requirements
 */
export class AdRequirementsAgent {
  /**
   * Parse natural language campaign requirements into structured parameters
   * 
   * @param requestText - Natural language description of campaign requirements
   * @returns ValidationResult with extracted parameters and missing fields
   * @throws Error if agent call fails or response cannot be parsed
   */
  async parseRequirements(requestText: string): Promise<ValidationResult> {
    try {
      // Try to use plugin if available, otherwise fall back to embedded instructions
      let pluginPath: string | null = null;
      try {
        pluginPath = this.resolvePluginPath();
      } catch (e) {
        console.warn('Plugin not found, using embedded instructions:', e instanceof Error ? e.message : e);
      }

      const prompt = pluginPath
        ? `Use the "parse-ad-requirements" skill to extract structured advertising campaign parameters from the following request:

"${requestText}"

Return a JSON object with the extracted parameters, missing fields, and suggestions.`
        : this.buildEmbeddedPrompt(requestText);

      const assistantSnippets: string[] = [];
      let resultMessage: SDKResultMessage | undefined;

      // Run the agent
      for await (const message of query({
        prompt,
        options: {
          plugins: pluginPath ? [{ type: 'local', path: pluginPath }] : undefined,
          allowedTools: pluginPath ? ['Skill', 'Read'] : ['Read'],
          maxTurns: pluginPath ? 10 : 3,
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
      const validatedResult = ValidationResultSchema.parse(parsedResult);
      
      return validatedResult;
    } catch (error) {
      console.error('Error in parseRequirements:', error);
      throw new Error(`Failed to parse requirements: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
   * Build embedded prompt with skill instructions when plugin is not available
   */
  private buildEmbeddedPrompt(requestText: string): string {
    const skillInstructions = `You are an advertising campaign requirements parser. Extract structured parameters from campaign descriptions.

Extract these 12 fields:
1. product_or_service: The product, service, or brand
2. product_or_service_url: Website or landing page URL
3. campaign_name: Descriptive name for the campaign
4. target_audience: Demographics, interests, or characteristics
5. geography: Geographic targeting
6. ad_format: Type of ad creative (video, carousel, static image, etc.)
7. budget: Campaign budget with currency
8. platform: Advertising platform (TikTok, Facebook, Instagram, etc.)
9. kpi: Key performance indicators or success metrics
10. time_period: Campaign duration or timeline
11. creative_direction: Style, tone, or creative requirements
12. other_details: Additional requirements or context

Return ONLY a JSON object in this exact format (no markdown, no explanations):
{
  "success": true/false,
  "parameters": {
    "product_or_service": "value or null",
    "product_or_service_url": "value or null",
    "campaign_name": "value or null",
    "target_audience": "value or null",
    "geography": "value or null",
    "ad_format": "value or null",
    "budget": "value or null",
    "platform": "value or null",
    "kpi": "value or null",
    "time_period": "value or null",
    "creative_direction": "value or null",
    "other_details": "value or null"
  },
  "missingFields": ["field1", "field2"],
  "suggestions": {
    "field1": "helpful suggestion",
    "field2": "helpful suggestion"
  }
}

Rules:
- Use null for missing fields
- Set success to true only if ALL fields are populated
- List all missing field names in missingFields array
- Provide helpful suggestions for missing fields`;

    return `${skillInstructions}\n\nCampaign request: "${requestText}"`;
  }

  /**
   * Resolve the path to the parse-ad-requirements plugin
   */
  private resolvePluginPath(): string {
    // Primary path: src/plugins/parse-ad-requirements
    const pluginPath = resolve(__dirname, '..', 'plugins', 'parse-ad-requirements');
    
    // Check if plugin exists with valid manifest
    if (existsSync(pluginPath)) {
      const manifestPath = resolve(pluginPath, 'skills', 'parse-ad-requirements', 'SKILL.md');
      if (existsSync(manifestPath)) {
        console.log(`✅ Found parse-ad-requirements plugin at: ${pluginPath}`);
        return pluginPath;
      }
    }

    throw new Error(
      `parse-ad-requirements plugin not found at expected location: ${pluginPath}. Expected structure: src/plugins/parse-ad-requirements/skills/parse-ad-requirements/SKILL.md`
    );
  }
}

/**
 * Singleton instance of the agent service
 */
export const adRequirementsAgent = new AdRequirementsAgent();
