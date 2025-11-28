import { z } from 'zod';
import { ImageVariationSchema, ImageDimensionsSchema } from './ad-images.js';
import { AdCopyVariationSchema } from './ad-copy.js';

/**
 * Schema for ad copy used in mixed media composite
 */
export const AdCopyUsedSchema = z.object({
  headline: z.string().min(1, 'Headline must not be empty'),
  body_copy: z.string().min(1, 'Body copy must not be empty'),
  cta: z.string().min(1, 'CTA must not be empty')
});

export type AdCopyUsed = z.infer<typeof AdCopyUsedSchema>;

/**
 * Schema for complete mixed media generation result
 */
export const MixedMediaResultSchema = z.object({
  generated_at: z.string().datetime('Generated timestamp must be ISO datetime'),
  composite_image_url: z.string().url('Composite image URL must be a valid URL'),
  thumbnail_url: z.string().url().nullable().optional(),
  mime_type: z.string().regex(
    /^image\/(png|jpeg|webp)$/,
    'Mime type must be image/png, image/jpeg, or image/webp'
  ),
  platform: z.string().min(1, 'Platform must not be empty'),
  dimensions: ImageDimensionsSchema,
  source_image_variation: z.enum(['A', 'B'], {
    errorMap: () => ({ message: 'Source image variation must be A or B' })
  }),
  ad_copy_used: AdCopyUsedSchema
});

export type MixedMediaResult = z.infer<typeof MixedMediaResultSchema>;

/**
 * Schema for generate mixed media tool input
 * Accepts either campaignId (to retrieve from database) or inline parameters
 */
export const GenerateMixedMediaInputSchema = z.object({
  campaignId: z.string().uuid('Campaign ID must be a valid UUID').optional(),
  selectedImageVariation: z.enum(['A', 'B']).optional(),
  selectedImage: ImageVariationSchema.optional(),
  adCopy: AdCopyVariationSchema.optional(),
  platform: z.string().min(1, 'Platform must not be empty').optional()
}).refine(
  data => data.campaignId || (data.selectedImage && data.adCopy && data.platform),
  { message: 'Either campaignId or (selectedImage, adCopy, and platform) must be provided' }
);

export type GenerateMixedMediaInput = z.infer<typeof GenerateMixedMediaInputSchema>;
