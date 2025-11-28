import { z } from 'zod';
import { CampaignParametersSchema } from './campaign-params.js';
import { CampaignReportSchema } from './ad-research.js';
import { AdCopyVariationSchema } from './ad-copy.js';

/**
 * Platform-specific image dimensions
 * Based on advertising platform best practices
 */
export const PLATFORM_DIMENSIONS = {
  tiktok: { width: 1080, height: 1920 },           // 9:16 vertical
  instagram_feed: { width: 1080, height: 1080 },   // 1:1 square
  instagram_story: { width: 1080, height: 1920 },  // 9:16 vertical
  facebook_feed: { width: 1200, height: 628 },     // 1.91:1 landscape
  facebook_story: { width: 1080, height: 1920 },   // 9:16 vertical
  linkedin: { width: 1200, height: 627 }           // 1.91:1 landscape
} as const;

/**
 * Schema for image dimensions
 */
export const ImageDimensionsSchema = z.object({
  width: z.number().positive('Width must be positive'),
  height: z.number().positive('Height must be positive')
});

export type ImageDimensions = z.infer<typeof ImageDimensionsSchema>;

/**
 * Schema for a single image variation
 */
export const ImageVariationSchema = z.object({
  variation_id: z.enum(['A', 'B'], {
    errorMap: () => ({ message: 'Variation ID must be A or B' })
  }),
  image_url: z.string().url('Image URL must be a valid URL'),
  thumbnail_url: z.string().url().nullable().optional(),
  file_id: z.string().nullable().optional(),
  mime_type: z.string().regex(
    /^image\/(png|jpeg|webp)$/,
    'Mime type must be image/png, image/jpeg, or image/webp'
  ),
  prompt_used: z.string().min(1, 'Prompt must not be empty'),
  visual_approach: z.string().min(1, 'Visual approach description required'),
  dimensions: ImageDimensionsSchema
});

export type ImageVariation = z.infer<typeof ImageVariationSchema>;

/**
 * Schema for complete ad images generation result
 */
export const AdImagesResultSchema = z.object({
  generated_at: z.string().datetime('Generated timestamp must be ISO datetime'),
  campaign_name: z.string().nullable(),
  platform: z.string().nullable(),
  target_audience: z.string().nullable(),
  variations: z.array(ImageVariationSchema)
    .length(2, 'Must have exactly two variations'),
  recommended_variation: z.enum(['A', 'B'], {
    errorMap: () => ({ message: 'Recommended variation must be A or B' })
  }),
  recommendation_rationale: z.string().min(1, 'Recommendation rationale must not be empty'),
  selected_ad_copy: AdCopyVariationSchema.optional()
});

export type AdImagesResult = z.infer<typeof AdImagesResultSchema>;

/**
 * Schema for generate ad images tool input
 * Accepts either campaignId (to retrieve from database) or inline parameters
 */
export const GenerateAdImagesInputSchema = z.object({
  campaignId: z.string().uuid('Campaign ID must be a valid UUID').optional(),
  campaignParameters: CampaignParametersSchema.optional(),
  campaignReport: CampaignReportSchema.optional(),
  selectedAdCopy: AdCopyVariationSchema.optional()
}).refine(
  data => data.campaignId || data.campaignParameters,
  { message: 'Either campaignId or campaignParameters must be provided' }
);

export type GenerateAdImagesInput = z.infer<typeof GenerateAdImagesInputSchema>;
