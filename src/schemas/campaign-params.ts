import { z } from 'zod';

/**
 * Schema for campaign parameters extracted from advertiser input
 * All fields are nullable to support incremental extraction
 */
export const CampaignParametersSchema = z.object({
  product_or_service: z.string().nullable(),
  product_or_service_url: z.string().url().nullable().or(z.literal(null)),
  campaign_name: z.string().nullable(),
  target_audience: z.string().nullable(),
  geography: z.string().nullable(),
  ad_format: z.string().nullable(),
  budget: z.string().nullable(),
  platform: z.string().nullable(),
  kpi: z.string().nullable(),
  time_period: z.string().nullable(),
  creative_direction: z.string().nullable(),
  other_details: z.string().nullable()
});

export type CampaignParameters = z.infer<typeof CampaignParametersSchema>;

/**
 * Schema for validation result returned by the agent
 */
export const ValidationResultSchema = z.object({
  success: z.boolean(),
  parameters: CampaignParametersSchema,
  missingFields: z.array(z.string()),
  suggestions: z.record(z.string()).optional()
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

/**
 * Schema for parse ad requirements tool input
 * Validates that requestText is non-empty and contains non-whitespace characters
 */
export const ParseAdRequirementsInputSchema = z.object({
  requestText: z.string()
    .min(1, 'Request text must not be empty')
    .refine(
      (val) => val.trim().length > 0,
      { message: 'Request text must contain non-whitespace characters' }
    )
});

export type ParseAdRequirementsInput = z.infer<typeof ParseAdRequirementsInputSchema>;
