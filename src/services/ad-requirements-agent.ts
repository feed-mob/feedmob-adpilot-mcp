import { query, type SDKMessage, type SDKResultMessage } from '@anthropic-ai/claude-agent-sdk';
import { ValidationResult, ValidationResultSchema } from '../schemas/campaign-params.js';

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
      const prompt = `Parse the following advertising campaign request and extract structured parameters:\n\n"${requestText}"\n\nReturn ONLY a valid JSON object with the campaign parameters following the parse-ad-requirements skill instructions. Do not include any explanatory text before or after the JSON.`;

      const assistantSnippets: string[] = [];
      let resultMessage: SDKResultMessage | undefined;

      // Run the agent with the skill
      for await (const message of query({
        prompt,
        options: {
          cwd: process.cwd(),
          settingSources: ['user', 'project'],
          allowedTools: ['Skill', 'Read'],
          maxTurns: 3,
          model: 'claude-sonnet-4-5'
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
}

/**
 * Singleton instance of the agent service
 */
export const adRequirementsAgent = new AdRequirementsAgent();
