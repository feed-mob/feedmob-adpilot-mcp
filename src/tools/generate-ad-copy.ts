import { z } from 'zod';
import { GenerateAdCopyInputSchema } from '../schemas/ad-copy.js';
import { adCopyAgent } from '../services/ad-copy-agent.js';
import { createAdCopyUI, createAdCopyErrorUI } from '../utils/ad-copy-ui.js';
import type { CampaignParameters } from '../schemas/campaign-params.js';
import type { CampaignReport } from '../schemas/ad-research.js';
import { campaignService } from '../services/campaign.js';
import { CampaignNotFoundError } from '../errors/campaign-errors.js';

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

      let campaignId: string | undefined = validated.campaignId;
      let campaignParameters: CampaignParameters;
      let campaignReport: CampaignReport | undefined = validated.campaignReport;

      // Resolve campaign parameters and research context
      if (validated.campaignId) {
        const campaign = await campaignService.getCampaignOrThrow(validated.campaignId);

        if (validated.campaignParameters) {
          campaignParameters = validated.campaignParameters;
          await campaignService.updateParameters(validated.campaignId, campaignParameters);
        } else if (campaign.parameters) {
          campaignParameters = campaign.parameters;
        } else {
          throw new Error('Campaign has no parameters stored. Please provide campaignParameters.');
        }

        if (validated.campaignReport) {
          campaignReport = validated.campaignReport;
          await campaignService.updateResearch(validated.campaignId, campaignReport);
        } else if (campaign.research) {
          campaignReport = campaign.research;
        }
      } else if (validated.campaignParameters) {
        campaignParameters = validated.campaignParameters;
        campaignReport = validated.campaignReport;
      } else {
        throw new Error('Either campaignId or campaignParameters must be provided');
      }

      // Call agent service to generate ad copy
      const result = await adCopyAgent.generateCopy(
        campaignParameters,
        campaignReport
      );

      // Persist generated ad copy when tied to a campaign
      if (campaignId) {
        try {
          await campaignService.updateAdCopy(campaignId, result);
        } catch (dbError) {
          console.error('Failed to store ad copy:', dbError);
        }
      }

      // Generate UI for the result
      const uiResource = createAdCopyUI(result, campaignId);

      // Create text summary for the LLM
      const variationA = result.variations.find(v => v.variation_id === 'A');
      const variationB = result.variations.find(v => v.variation_id === 'B');
      
      const textSummary = `Ad Copy Variations Generated:

${campaignId ? `Campaign ID: ${campaignId}\n` : ''}Campaign: ${result.campaign_name || 'Unnamed Campaign'}
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
      let errorType: 'validation' | 'agent' | 'timeout' | 'not_found' | 'unknown' = 'unknown';
      
      if (error instanceof z.ZodError) {
        errorType = 'validation';
      } else if (error instanceof CampaignNotFoundError) {
        errorType = 'not_found';
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
