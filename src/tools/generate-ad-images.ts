import { z } from 'zod';
import { GenerateAdImagesInputSchema } from '../schemas/ad-images.js';
import type { CampaignParameters } from '../schemas/campaign-params.js';
import type { CampaignReport } from '../schemas/ad-research.js';
import type { AdCopyVariation } from '../schemas/ad-copy.js';
import { adImagesAgent } from '../services/ad-images-agent.js';
import { createAdImagesUI, createAdImagesErrorUI } from '../utils/ad-images-ui.js';
import { campaignService } from '../services/campaign.js';
import { CampaignNotFoundError } from '../errors/campaign-errors.js';

export const generateAdImagesTool = {
  name: 'generateAdImages',
  description: 'Generate two AI-powered image variations. Accepts campaignId or inline parameters.',
  parameters: GenerateAdImagesInputSchema,
  execute: async (args: z.infer<typeof GenerateAdImagesInputSchema>) => {
    try {
      const validated = GenerateAdImagesInputSchema.parse(args);
      
      let campaignId: string | undefined = validated.campaignId;
      let campaignParameters: CampaignParameters;
      let campaignReport: CampaignReport | undefined;
      let selectedAdCopy: AdCopyVariation | undefined = validated.selectedAdCopy;
      
      if (validated.campaignId) {
        const campaign = await campaignService.getCampaignOrThrow(validated.campaignId);
        if (!campaign.parameters) {
          throw new Error('Campaign has no parameters stored.');
        }
        campaignParameters = campaign.parameters;
        campaignReport = campaign.research ?? undefined;
        
        // Use stored ad copy selection if available and not provided inline
        if (!selectedAdCopy && campaign.ad_copy && campaign.selected_ad_copy_variation) {
          const variation = campaign.ad_copy.variations.find(
            v => v.variation_id === campaign.selected_ad_copy_variation
          );
          if (variation) selectedAdCopy = variation;
        }
        
        // Store ad copy selection if provided
        if (validated.selectedAdCopy && campaign.id) {
          await campaignService.selectAdCopyVariation(campaign.id, validated.selectedAdCopy.variation_id);
        }
      } else if (validated.campaignParameters) {
        campaignParameters = validated.campaignParameters;
        campaignReport = validated.campaignReport;
      } else {
        throw new Error('Either campaignId or campaignParameters must be provided');
      }
      
      const agentResult = await adImagesAgent.generateImages(campaignParameters, campaignReport);
      const result = selectedAdCopy ? { ...agentResult, selected_ad_copy: selectedAdCopy } : agentResult;

      
      // Store result if we have a campaign ID
      if (campaignId) {
        try {
          await campaignService.updateImages(campaignId, result);
        } catch (dbError) {
          console.error('Failed to store images:', dbError);
        }
      }
      
      const uiResource = createAdImagesUI(result, campaignId);
      
      const textSummary = `Generated two ad image variations:

${campaignId ? `Campaign ID: ${campaignId}\n` : ''}
**Variation A** (${result.recommended_variation === 'A' ? '⭐ Recommended' : ''}):
- Image URL: ${result.variations[0].image_url}
- Visual Approach: ${result.variations[0].visual_approach}
- Dimensions: ${result.variations[0].dimensions.width}×${result.variations[0].dimensions.height}

**Variation B** (${result.recommended_variation === 'B' ? '⭐ Recommended' : ''}):
- Image URL: ${result.variations[1].image_url}
- Visual Approach: ${result.variations[1].visual_approach}
- Dimensions: ${result.variations[1].dimensions.width}×${result.variations[1].dimensions.height}

**Recommendation**: ${result.recommendation_rationale}
${campaignId ? '\nSelect a variation to proceed with mixed media creative generation.' : ''}`;
      
      return {
        content: [
          { type: 'text' as const, text: textSummary },
          uiResource
        ]
      };
    } catch (error) {
      let errorType: 'validation' | 'api' | 'timeout' | 'not_found' | 'unknown' = 'unknown';
      
      if (error instanceof z.ZodError) {
        errorType = 'validation';
      } else if (error instanceof CampaignNotFoundError) {
        errorType = 'not_found';
      } else if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('took too long')) {
          errorType = 'timeout';
        } else if (error.message.includes('Gemini') || error.message.includes('API')) {
          errorType = 'api';
        }
      }
      
      const errorUI = createAdImagesErrorUI(
        error instanceof Error ? error : new Error('Unknown error occurred'),
        errorType
      );
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        content: [
          { type: 'text' as const, text: `Error generating ad images: ${errorMessage}` },
          errorUI
        ]
      };
    }
  }
};
