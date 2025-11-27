import { z } from 'zod';
import { ParseAdRequirementsInputSchema } from '../schemas/campaign-params.js';
import { adRequirementsAgent } from '../services/ad-requirements-agent.js';
import { createParametersUI, createErrorUI } from '../utils/ad-requirements-ui.js';

/**
 * Parse Ad Requirements tool configuration for FastMCP
 */
export const parseAdRequirementsTool = {
  name: 'parseAdRequirements',
  description: 'Parse natural language advertising campaign requirements into structured parameters. Extracts product, audience, budget, platform, KPIs, and other campaign details.',
  parameters: ParseAdRequirementsInputSchema,
  execute: async (args: z.infer<typeof ParseAdRequirementsInputSchema>) => {
    try {
      // Validate input
      const validated = ParseAdRequirementsInputSchema.parse(args);
      
      // Call agent service to parse requirements
      const result = await adRequirementsAgent.parseRequirements(validated.requestText);
      
      // Generate UI for the result
      const uiResource = createParametersUI(result);
      
      // Create text summary for the LLM
      const { parameters } = result;
      const textSummary = `Parsed campaign requirements:

Product/Service: ${parameters.product_or_service || 'Not specified'}
Product URL: ${parameters.product_or_service_url || 'Not specified'}
Campaign Name: ${parameters.campaign_name || 'Not specified'}
Target Audience: ${parameters.target_audience || 'Not specified'}
Geography: ${parameters.geography || 'Not specified'}
Ad Format: ${parameters.ad_format || 'Not specified'}
Budget: ${parameters.budget || 'Not specified'}
Platform: ${parameters.platform || 'Not specified'}
KPIs: ${parameters.kpi || 'Not specified'}
Time Period: ${parameters.time_period || 'Not specified'}
Creative Direction: ${parameters.creative_direction || 'Not specified'}
Other Details: ${parameters.other_details || 'Not specified'}

Missing Fields: ${result.missingFields.length > 0 ? result.missingFields.join(', ') : 'None'}
Status: ${result.success ? '✓ Complete' : '⚠ Incomplete'}`;
      
      return {
        content: [
          {
            type: 'text' as const,
            text: textSummary
          },
          uiResource
        ]
      };
    } catch (error) {
      console.error('Error in parseAdRequirements tool:', error);
      
      // Determine error type
      let errorType: 'validation' | 'agent' | 'timeout' | 'unknown' = 'unknown';
      
      if (error instanceof z.ZodError) {
        errorType = 'validation';
      } else if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          errorType = 'timeout';
        } else if (error.message.includes('Failed to parse requirements')) {
          errorType = 'agent';
        }
      }
      
      // Generate error UI
      const errorUI = createErrorUI(
        error instanceof Error ? error : new Error('Unknown error occurred'),
        errorType
      );
      
      // Create text error message for the LLM
      const errorMessage = error instanceof Error 
        ? `Error parsing campaign requirements: ${error.message}`
        : 'An unknown error occurred while parsing campaign requirements';
      
      return {
        content: [
          {
            type: 'text' as const,
            text: errorMessage
          },
          errorUI
        ]
      };
    }
  }
};
