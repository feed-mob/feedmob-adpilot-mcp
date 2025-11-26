import { z } from 'zod';

export const GenerateAdCopySchema = z.object({
  campaignId: z.string().uuid().describe("Campaign ID for which to generate ad copy")
});

export type GenerateAdCopyArgs = z.infer<typeof GenerateAdCopySchema>;

// Tool implementation will be added in later tasks
