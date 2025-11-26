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
      
      return {
        content: [uiResource]
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
      
      return {
        content: [errorUI]
      };
    }
  }
};
