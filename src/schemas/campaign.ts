import { z } from 'zod';
import { CampaignParametersSchema } from './campaign-params.js';
import { CampaignReportSchema } from './ad-research.js';
import { AdCopyResultSchema } from './ad-copy.js';
import { AdImagesResultSchema } from './ad-images.js';
import { MixedMediaResultSchema } from './mixed-media.js';

/**
 * Schema for variation selection
 */
export const VariationSelectionSchema = z.enum(['A', 'B']);
export type VariationSelection = z.infer<typeof VariationSelectionSchema>;

/**
 * Schema for complete campaign entity stored in database
 */
export const CampaignSchema = z.object({
  // Identity
  id: z.string().uuid(),
  
  // Campaign data (JSONB columns)
  parameters: CampaignParametersSchema.nullable(),
  research: CampaignReportSchema.nullable(),
  ad_copy: AdCopyResultSchema.nullable(),
  images: AdImagesResultSchema.nullable(),
  mixed_media: MixedMediaResultSchema.nullable(),
  
  // User selections
  selected_ad_copy_variation: VariationSelectionSchema.nullable(),
  selected_image_variation: VariationSelectionSchema.nullable(),
  
  // Timestamps
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  
  // Component timestamps
  parameters_updated_at: z.coerce.date().nullable(),
  research_updated_at: z.coerce.date().nullable(),
  ad_copy_updated_at: z.coerce.date().nullable(),
  images_updated_at: z.coerce.date().nullable(),
  mixed_media_updated_at: z.coerce.date().nullable(),
});

export type Campaign = z.infer<typeof CampaignSchema>;

/**
 * Schema for campaign creation input
 */
export const CreateCampaignInputSchema = z.object({
  parameters: CampaignParametersSchema,
});

export type CreateCampaignInput = z.infer<typeof CreateCampaignInputSchema>;

/**
 * Schema for getCampaign tool input
 */
export const GetCampaignInputSchema = z.object({
  campaignId: z.string().uuid('Campaign ID must be a valid UUID'),
});

export type GetCampaignInput = z.infer<typeof GetCampaignInputSchema>;

/**
 * Helper to determine campaign completion status
 */
export interface CampaignCompletionStatus {
  hasParameters: boolean;
  hasResearch: boolean;
  hasAdCopy: boolean;
  hasImages: boolean;
  hasMixedMedia: boolean;
  hasSelectedAdCopy: boolean;
  hasSelectedImage: boolean;
  isComplete: boolean;
}

/**
 * Get completion status for a campaign
 */
export function getCampaignCompletionStatus(campaign: Campaign): CampaignCompletionStatus {
  const hasParameters = campaign.parameters !== null;
  const hasResearch = campaign.research !== null;
  const hasAdCopy = campaign.ad_copy !== null;
  const hasImages = campaign.images !== null;
  const hasMixedMedia = campaign.mixed_media !== null;
  const hasSelectedAdCopy = campaign.selected_ad_copy_variation !== null;
  const hasSelectedImage = campaign.selected_image_variation !== null;
  
  return {
    hasParameters,
    hasResearch,
    hasAdCopy,
    hasImages,
    hasMixedMedia,
    hasSelectedAdCopy,
    hasSelectedImage,
    isComplete: hasParameters && hasResearch && hasAdCopy && hasImages && hasMixedMedia,
  };
}
