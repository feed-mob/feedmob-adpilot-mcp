import { z } from 'zod';
import { GenerateMixedMediaInputSchema } from '../schemas/mixed-media.js';
import type { ImageVariation } from '../schemas/ad-images.js';
import type { AdCopyVariation } from '../schemas/ad-copy.js';
import { mixedMediaAgent } from '../services/mixed-media-agent.js';
import { createMixedMediaUI, createMixedMediaErrorUI } from '../utils/mixed-media-ui.js';
import { campaignService } from '../services/campaign.js';
import { CampaignNotFoundError, MissingAssetsError } from '../errors/campaign-errors.js';

export const generateMixedMediaCreativeTool = {
  name: 'generateMixedMediaCreative',
  description: 'Generate a mixed media creative by combining image and ad copy. Accepts campaignId or inline parameters.',
  parameters: GenerateMixedMediaInputSchema,
  execute: async (args: z.infer<typeof GenerateMixedMediaInputSchema>) => {
    try {
      const validated = GenerateMixedMediaInputSchema.parse(args);
      
      let campaignId: string | undefined = validated.campaignId;
      let selectedImage: ImageVariation;
      let adCopy: AdCopyVariation;
      let platform: string;
      
      if (validated.campaignId) {
        const campaign = await campaignService.getCampaignOrThrow(validated.campaignId);
        
        // Get platform from parameters
        platform = campaign.parameters?.platform || 'tiktok';
        
        // Get selected image variation
        const imageVariationId = validated.selectedImageVariation || campaign.selected_image_variation;
        if (!campaign.images) {
          throw new MissingAssetsError(validated.campaignId, ['images']);
        }
        
        if (imageVariationId) {
          const img = campaign.images.variations.find(v => v.variation_id === imageVariationId);
          if (img) {
            selectedImage = img;
            // Store the selection
            await campaignService.selectImageVariation(validated.campaignId, imageVariationId);
          } else {
            throw new MissingAssetsError(validated.campaignId, ['selected image']);
          }
        } else {
          // Use recommended variation
          selectedImage = campaign.images.variations.find(
            v => v.variation_id === campaign.images!.recommended_variation
          ) || campaign.images.variations[0];
        }
        
        // Get selected ad copy variation
        if (!campaign.ad_copy) {
          throw new MissingAssetsError(validated.campaignId, ['ad copy']);
        }

        
        const adCopyVariationId = campaign.selected_ad_copy_variation;
        if (adCopyVariationId) {
          const copy = campaign.ad_copy.variations.find(v => v.variation_id === adCopyVariationId);
          if (copy) {
            adCopy = copy;
          } else {
            throw new MissingAssetsError(validated.campaignId, ['selected ad copy']);
          }
        } else {
          // Use recommended variation
          adCopy = campaign.ad_copy.variations.find(
            v => v.variation_id === campaign.ad_copy!.recommended_variation
          ) || campaign.ad_copy.variations[0];
        }
      } else if (validated.selectedImage && validated.adCopy && validated.platform) {
        selectedImage = validated.selectedImage;
        adCopy = validated.adCopy;
        platform = validated.platform;
      } else {
        throw new Error('Either campaignId or (selectedImage, adCopy, and platform) must be provided');
      }
      
      const result = await mixedMediaAgent.generateComposite(selectedImage, adCopy, platform);
      
      // Store result if we have a campaign ID
      if (campaignId) {
        try {
          await campaignService.updateMixedMedia(campaignId, result);
        } catch (dbError) {
          console.error('Failed to store mixed media:', dbError);
        }
      }
      
      const uiResource = createMixedMediaUI(result, campaignId);
      
      const textSummary = `Generated mixed media creative:

${campaignId ? `Campaign ID: ${campaignId}\n` : ''}
**Composite Image URL**: ${result.composite_image_url}
**Platform**: ${result.platform}
**Dimensions**: ${result.dimensions.width}×${result.dimensions.height}
**Source Image**: Variation ${result.source_image_variation}

**Ad Copy**:
- Headline: ${result.ad_copy_used.headline}
- Body: ${result.ad_copy_used.body_copy}
- CTA: ${result.ad_copy_used.cta}

The creative is ready for download and use in your ${result.platform} campaign.`;
      
      return {
        content: [
          { type: 'text' as const, text: textSummary },
          uiResource
        ]
      };
    } catch (error) {
      let errorType: 'validation' | 'generation' | 'not_found' | 'missing_assets' | 'unknown' = 'unknown';
      
      if (error instanceof z.ZodError) {
        errorType = 'validation';
      } else if (error instanceof CampaignNotFoundError) {
        errorType = 'not_found';
      } else if (error instanceof MissingAssetsError) {
        errorType = 'missing_assets';
      } else if (error instanceof Error) {
        if (error.message.includes('generate') || error.message.includes('composite')) {
          errorType = 'generation';
        }
      }
      
      const errorUI = createMixedMediaErrorUI(
        error instanceof Error ? error : new Error('Unknown error occurred'),
        errorType
      );
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        content: [
          { type: 'text' as const, text: `Error generating mixed media creative: ${errorMessage}` },
          errorUI
        ]
      };
    }
  }
};
