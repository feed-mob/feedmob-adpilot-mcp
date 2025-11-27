import { z } from 'zod';
import { GenerateAdCopyInputSchema } from '../schemas/ad-copy.js';
import { adCopyAgent } from '../services/ad-copy-agent.js';
import { createAdCopyUI, createAdCopyErrorUI } from '../utils/ad-copy-ui.js';

/**
 * Generate Ad Copy tool configuration for FastMCP
 */
export const generateAdCopyTool = {
  name: 'generateAdCopy',
  description: 'Generate two distinct, creative, and copyright-compliant ad copy variations based on campaign parameters and optional research insights. Each variation includes a headline, body copy, and call-to-action tailored to the target platform and audience. Returns an interactive UI for comparing and selecting variations.',
  parameters: GenerateAdCopyInputSchema,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false
  },
  execute: async (args: z.infer<typeof GenerateAdCopyInputSchema>) => {
    try {
      // Validate input
      const validated = GenerateAdCopyInputSchema.parse(args);
      
      // Call agent service to generate ad copy
      const result = await adCopyAgent.generateCopy(
        validated.campaignParameters,
        validated.campaignReport
      );
      
      // Generate UI for the result
      const uiResource = createAdCopyUI(result);
      
      // Create text summary for the LLM
      const variationA = result.variations.find(v => v.variation_id === 'A');
      const variationB = result.variations.find(v => v.variation_id === 'B');
      
      const textSummary = `Ad Copy Variations Generated:

Campaign: ${result.campaign_name || 'Unnamed Campaign'}
Platform: ${result.platform || 'Not specified'}
Target Audience: ${result.target_audience || 'Not specified'}
Generated: ${new Date(result.generated_at).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VARIATION A ${result.recommended_variation === 'A' ? '⭐ RECOMMENDED' : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Headline:
${variationA?.headline}

📄 Body Copy:
${variationA?.body_copy}

🎯 Call to Action:
${variationA?.cta}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VARIATION B ${result.recommended_variation === 'B' ? '⭐ RECOMMENDED' : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Headline:
${variationB?.headline}

📄 Body Copy:
${variationB?.body_copy}

🎯 Call to Action:
${variationB?.cta}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Recommendation:
Variation ${result.recommended_variation} is recommended. ${result.recommendation_rationale}

The interactive UI above displays both variations side-by-side for easy comparison. You can select your preferred variation to proceed with your campaign.`;
      
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
      console.error('Error in generateAdCopy tool:', error);
      
      // Determine error type
      let errorType: 'validation' | 'agent' | 'timeout' | 'unknown' = 'unknown';
      
      if (error instanceof z.ZodError) {
        errorType = 'validation';
      } else if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          errorType = 'timeout';
        } else if (error.message.includes('Failed to generate ad copy')) {
          errorType = 'agent';
        }
      }
      
      // Generate error UI
      const errorUI = createAdCopyErrorUI(
        error instanceof Error ? error : new Error('Unknown error occurred'),
        errorType
      );
      
      // Create text error message for the LLM
      const errorMessage = error instanceof Error 
        ? `Error generating ad copy: ${error.message}`
        : 'An unknown error occurred while generating ad copy';
      
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

