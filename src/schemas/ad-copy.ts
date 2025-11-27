import { z } from 'zod';
import { CampaignParametersSchema } from './campaign-params.js';
import { CampaignReportSchema } from './ad-research.js';

/**
 * Schema for a single ad copy variation
 */
export const AdCopyVariationSchema = z.object({
  variation_id: z.enum(['A', 'B'], { 
    errorMap: () => ({ message: 'Variation ID must be A or B' }) 
  }),
  headline: z.string().min(1, 'Headline must not be empty'),
  body_copy: z.string().min(1, 'Body copy must not be empty'),
  cta: z.string().min(1, 'CTA must not be empty'),
  tone: z.string().nullable(),
  platform_optimized: z.boolean()
});

export type AdCopyVariation = z.infer<typeof AdCopyVariationSchema>;

/**
 * Schema for complete ad copy generation result
 */
export const AdCopyResultSchema = z.object({
  generated_at: z.string().datetime('Generated timestamp must be ISO datetime'),
  campaign_name: z.string().nullable(),
  platform: z.string().nullable(),
  target_audience: z.string().nullable(),
  variations: z.array(AdCopyVariationSchema)
    .length(2, 'Must have exactly two variations'),
  recommended_variation: z.enum(['A', 'B'], {
    errorMap: () => ({ message: 'Recommended variation must be A or B' })
  }),
  recommendation_rationale: z.string().min(1, 'Recommendation rationale must not be empty'),
  disclaimer: z.string().min(1, 'Disclaimer must not be empty')
});

export type AdCopyResult = z.infer<typeof AdCopyResultSchema>;

/**
 * Schema for generate ad copy tool input
 */
export const GenerateAdCopyInputSchema = z.object({
  campaignParameters: CampaignParametersSchema,
  campaignReport: CampaignReportSchema.optional()
});

export type GenerateAdCopyInput = z.infer<typeof GenerateAdCopyInputSchema>;

