import { z } from 'zod';
import { GetCampaignInputSchema, getCampaignCompletionStatus } from '../schemas/campaign.js';
import { campaignService } from '../services/campaign.js';
import { createCampaignUI, createCampaignErrorUI } from '../utils/campaign-ui.js';
import { CampaignNotFoundError } from '../errors/campaign-errors.js';

/**
 * Get Campaign tool configuration for FastMCP
 * 
 * Retrieves complete campaign data including all generated assets.
 */
export const getCampaignTool = {
  name: 'getCampaign',
  description: 'Retrieve complete campaign data including parameters, research, ad copy, images, and mixed media. Shows completion status for each component.',
  parameters: GetCampaignInputSchema,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true
  },
  execute: async (args: z.infer<typeof GetCampaignInputSchema>) => {
    try {
      const validated = GetCampaignInputSchema.parse(args);
      const campaign = await campaignService.getCampaignOrThrow(validated.campaignId);
      const status = getCampaignCompletionStatus(campaign);
      
      const uiResource = createCampaignUI(campaign);
      
      const textSummary = `Campaign: ${campaign.id}

**Status**: ${status.isComplete ? '✅ Complete' : '🔄 In Progress'}
**Created**: ${campaign.created_at.toLocaleString()}
**Updated**: ${campaign.updated_at.toLocaleString()}

**Components**:
- Parameters: ${status.hasParameters ? '✅' : '❌'} ${campaign.parameters_updated_at ? `(${campaign.parameters_updated_at.toLocaleString()})` : ''}
- Research: ${status.hasResearch ? '✅' : '❌'} ${campaign.research_updated_at ? `(${campaign.research_updated_at.toLocaleString()})` : ''}
- Ad Copy: ${status.hasAdCopy ? '✅' : '❌'} ${campaign.ad_copy_updated_at ? `(${campaign.ad_copy_updated_at.toLocaleString()})` : ''}
  - Selected: ${campaign.selected_ad_copy_variation || 'None'}
- Images: ${status.hasImages ? '✅' : '❌'} ${campaign.images_updated_at ? `(${campaign.images_updated_at.toLocaleString()})` : ''}
  - Selected: ${campaign.selected_image_variation || 'None'}
- Mixed Media: ${status.hasMixedMedia ? '✅' : '❌'} ${campaign.mixed_media_updated_at ? `(${campaign.mixed_media_updated_at.toLocaleString()})` : ''}

${campaign.parameters?.campaign_name ? `**Campaign Name**: ${campaign.parameters.campaign_name}` : ''}
${campaign.parameters?.platform ? `**Platform**: ${campaign.parameters.platform}` : ''}
${campaign.parameters?.budget ? `**Budget**: ${campaign.parameters.budget}` : ''}`;
      
      return {
        content: [
          { type: 'text' as const, text: textSummary },
          uiResource
        ]
      };
    } catch (error) {
      console.error('Error in getCampaign tool:', error);
      
      let errorType: 'validation' | 'not_found' | 'unknown' = 'unknown';
      
      if (error instanceof z.ZodError) {
        errorType = 'validation';
      } else if (error instanceof CampaignNotFoundError) {
        errorType = 'not_found';
      }
      
      const errorUI = createCampaignErrorUI(
        error instanceof Error ? error : new Error('Unknown error occurred'),
        errorType
      );
      
      const errorMessage = error instanceof Error 
        ? `Error retrieving campaign: ${error.message}`
        : 'An unknown error occurred while retrieving campaign';
      
      return {
        content: [
          { type: 'text' as const, text: errorMessage },
          errorUI
        ]
      };
    }
  }
};
